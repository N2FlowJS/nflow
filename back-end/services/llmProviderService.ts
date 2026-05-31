import { prisma } from '../lib/prisma';
import { SecretService } from './secretService';
import { listModels } from '../llm';
import { createLogger } from '../utils/logger';

const logger = createLogger('LLMProviderService');

export interface LLMProviderInput {
  name: string;
  provider: string;
  baseUrl?: string;
  apiKey?: string;
  config?: string;
}

export class LLMProviderService {
  private static async requireProvider(userId: string, providerId: string) {
    const provider = await prisma.lLMProvider.findFirst({ where: { id: providerId, userId } });
    if (!provider) throw new Error('LLM Provider not found');
    return provider;
  }

  static async listProviders(userId: string) {
    const providers = await prisma.lLMProvider.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return providers.map((p: any) => ({
      ...p,
      apiKey: p.apiKey ? '****' + SecretService.decryptSecret(p.apiKey).slice(-4) : undefined
    }));
  }

  static async createProvider(userId: string, input: LLMProviderInput) {
    return prisma.lLMProvider.create({
      data: {
        userId,
        name: input.name,
        provider: input.provider,
        baseUrl: input.baseUrl,
        apiKey: input.apiKey ? SecretService.encryptSecret(input.apiKey) : null,
        config: input.config,
      },
    });
  }

  static async updateProvider(userId: string, providerId: string, input: Partial<LLMProviderInput>) {
    await this.requireProvider(userId, providerId);
    
    const updateData: any = { ...input };
    if (input.apiKey) {
      updateData.apiKey = SecretService.encryptSecret(input.apiKey);
    }

    return prisma.lLMProvider.update({
      where: { id: providerId },
      data: updateData,
    });
  }

  static async deleteProvider(userId: string, providerId: string) {
    await this.requireProvider(userId, providerId);
    return prisma.lLMProvider.delete({ where: { id: providerId } });
  }

  static async testConnection(userId: string, providerId: string) {
    const provider = await this.requireProvider(userId, providerId);
    const apiKey = provider.apiKey ? SecretService.decryptSecret(provider.apiKey) : '';

    const cfg = {
      provider: provider.provider,
      baseUrl: provider.baseUrl || '',
      apiKey,
      model: '', // Empty model to just list models
    };

    try {
      const models = await listModels(cfg);
      return { ok: true, models };
    } catch (err) {
      logger.error('Test connection failed', err);
      throw new Error(`Connection failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /**
   * Resolve provider details for execution
   */
  static async resolveProvider(userId: string, providerId: string) {
    const provider = await this.requireProvider(userId, providerId);
    return {
      provider: provider.provider,
      baseUrl: provider.baseUrl,
      apiKey: provider.apiKey ? SecretService.decryptSecret(provider.apiKey) : undefined,
    };
  }
}
