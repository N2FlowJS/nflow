export class NodeExecutionError extends Error {
  relatedNodeIds: string[];
  constructor(message: string, relatedNodeIds: string[] = []) {
    super(message);
    this.relatedNodeIds = relatedNodeIds;
    Object.setPrototypeOf(this, NodeExecutionError.prototype);
  }
}
