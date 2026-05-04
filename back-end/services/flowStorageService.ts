import prisma from "../lib/prisma";

export class FlowStorageService {
  static requireUserId(userId?: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    return userId;
  }

  /**
   * Initialize storage (no-op for Prisma - database is already initialized)
   */
  static async ensureDir() {
    // Database already initialized during migration
    return;
  }

  /**
   * List all flows for a user
   */
  static async listFlowsForUser(userId: string) {
    const flows = await prisma.flow.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return flows.map((flow: any) => ({
      id: flow.id,
      name: flow.name,
      updatedAt: flow.updatedAt.getTime(),
      createdAt: flow.createdAt.getTime(),
      nodeCount: 0,
      edgeCount: 0,
    }));
  }

  /**
   * List all flows (for backwards compatibility)
   */
  static async listFlows() {
    const flows = await prisma.flow.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Calculate node and edge counts from data
    return flows.map((flow: any) => ({
      id: flow.id,
      name: flow.name,
      updatedAt: flow.updatedAt.getTime(),
      createdAt: flow.createdAt.getTime(),
      nodeCount: 0,
      edgeCount: 0,
    }));
  }

  static async listFlowsScoped(userId?: string) {
    const ownerId = this.requireUserId(userId);
    return this.listFlowsForUser(ownerId);
  }

  /**
   * Get a specific flow by ID
   */
  static async getFlow(id: string, userId?: string) {
    const flow = await prisma.flow.findUnique({
      where: { id },
    });

    if (!flow) {
      throw new Error(`Flow ${id} not found`);
    }

    const ownerId = this.requireUserId(userId);
    if (flow.userId !== ownerId) {
      throw new Error(`Flow ${id} not found`);
    }

    // Parse the JSON data
    const data = JSON.parse(flow.data);
    
    return {
      id: flow.id,
      name: flow.name,
      data,
      updatedAt: flow.updatedAt.getTime(),
      createdAt: flow.createdAt.getTime(),
      versions: data.versions || [],
    };
  }

  /**
   * Save or update a flow
   */
  static async saveFlow(flow: any) {
    if (!flow.id) {
      throw new Error('Flow ID is required');
    }

    const timestamp = Date.now();
    const isAutoSave = !!flow.isAutoSave;

    // Get existing flow if it exists
    let existingFlow = null;
    try {
      existingFlow = await prisma.flow.findUnique({
        where: { id: flow.id },
      });

      // Verify user owns this flow
      if (existingFlow && flow.userId && existingFlow.userId !== flow.userId) {
        throw new Error('Forbidden: User does not own this flow');
      }
    } catch (err) {
      // Flow doesn't exist yet or permission error
      if (err instanceof Error && err.message.includes('Forbidden')) {
        throw err;
      }
    }

    const ownerId = flow.userId || existingFlow?.userId || this.requireUserId(flow.userId);

    const currentFlowData = flow.data && typeof flow.data === 'object'
      ? flow.data
      : {
          nodes: flow.nodes || [],
          edges: flow.edges || [],
          globalVariables: flow.globalVariables || [],
          viewport: flow.viewport,
          metadata: flow.metadata,
          description: flow.description,
        };

    // Prepare versions
    let versions = [];
    if (existingFlow) {
      const existingData = JSON.parse(existingFlow.data);
      if (!isAutoSave) {
        // Create new version only if NOT auto-save
        const newVersion = {
          id: `v-${timestamp}`,
          timestamp,
          data: currentFlowData,
          label: flow.versionLabel || `Version ${new Date(timestamp).toLocaleString()}`,
        };
        versions = [newVersion, ...(existingData.versions || [])].slice(0, 50);
      } else {
        // Preserve existing versions during auto-save
        versions = existingData.versions || [];
      }
    } else {
      // First save: always create a version
      const newVersion = {
        id: `v-${timestamp}`,
        timestamp,
        data: currentFlowData,
        label: flow.versionLabel || 'Initial Version',
      };
      versions = [newVersion];
    }

    // Prepare flow data with versions
    const flowData = {
      ...currentFlowData,
      versions,
    };

    delete flow.versionLabel;

    // Save to database
    const savedFlow = await prisma.flow.upsert({
      where: { id: flow.id },
      create: {
        id: flow.id,
        name: flow.name || flow.id,
        userId: ownerId,
        data: JSON.stringify(flowData),
      },
      update: {
        name: flow.name || flow.id,
        data: JSON.stringify(flowData),
      },
    });

    return savedFlow.id;
  }

  /**
   * Delete a flow (only if user owns it)
   */
  static async deleteFlow(id: string, userId?: string) {
    try {
      // Get flow to verify ownership
      const flow = await prisma.flow.findUnique({
        where: { id },
      });

      if (!flow) {
        console.warn(`Flow ${id} not found`);
        return;
      }

      // Verify user owns this flow (if userId provided)
      if (userId && flow.userId !== userId) {
        throw new Error('Forbidden: User does not own this flow');
      }

      await prisma.flow.delete({
        where: { id },
      });

      if (userId) {
        console.log(`[Audit] User ${userId} deleted flow ${id}`);
      }
    } catch (err) {
      console.error(`Failed to delete flow ${id}:`, err);
      if (err instanceof Error && err.message.includes('Forbidden')) {
        throw err;
      }
    }
  }

  /**
   * Get all versions of a flow
   */
  static async getFlowVersions(id: string, userId?: string) {
    const flow = await this.getFlow(id, userId);
    const data = flow.data;
    const versions = data.versions || [];

    return versions.map((v: any) => ({
      id: v.id,
      timestamp: v.timestamp,
      label: v.label || `Version ${new Date(v.timestamp).toLocaleString()}`,
      isAutoSave: v.isAutoSave || false,
    }));
  }

  /**
   * Get a specific version of a flow
   */
  static async getFlowVersion(id: string, versionId: string, userId?: string) {
    const flow = await this.getFlow(id, userId);
    const data = flow.data;
    const versions = data.versions || [];
    const version = versions.find((v: any) => v.id === versionId);

    if (!version) {
      return null;
    }

    return {
      ...version,
      id: flow.id,
      name: flow.name,
      description: data.description,
    };
  }

  /**
   * Restore a previous version of a flow
   */
  static async restoreFlowVersion(id: string, versionId: string, userId?: string) {
    const ownerId = this.requireUserId(userId);
    const flow = await prisma.flow.findUnique({
      where: { id },
    });

    if (!flow) {
      throw new Error(`Flow ${id} not found`);
    }

    if (flow.userId !== ownerId) {
      throw new Error('Forbidden: User does not own this flow');
    }

    const data = JSON.parse(flow.data);
    const versions = data.versions || [];
    const version = versions.find((v: any) => v.id === versionId);

    if (!version) {
      throw new Error(`Version ${versionId} not found`);
    }

    // Create a new version for the restoration
    const timestamp = Date.now();
    const restoredVersion = {
      id: `v-${timestamp}`,
      timestamp,
      data: version.data,
      label: `Restored from ${version.label} at ${new Date().toLocaleString()}`,
      isAutoSave: false,
    };

    // Update versions list
    data.versions = [restoredVersion, ...versions].slice(0, 50);
    data.nodes = version.data.nodes;
    data.edges = version.data.edges;
    data.globalVariables = version.data.globalVariables || data.globalVariables || [];
    data.viewport = version.data.viewport || data.viewport;

    // Save restored flow
    await prisma.flow.update({
      where: { id },
      data: {
        data: JSON.stringify(data),
      },
    });

    if (userId) {
      console.log(`[Audit] User ${userId} restored flow ${id} to version ${versionId}`);
    }

    return {
      id,
      name: flow.name,
      data,
      updatedAt: timestamp,
      versions: data.versions,
    };
  }
}
