import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { createLogger } from '../utils/logger';

const logger = createLogger('Secret');

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';

interface CreateSecretInput {
  name: string;
  key: string;
  label?: string;
}

interface UserSecretResponse {
  id: string;
  name: string;
  label?: string;
  keyPreview: string; // Last 4 characters for display
  createdAt: Date;
  lastUsedAt?: Date;
}

export class SecretService {
  private static async requireSecret(userId: string, secretId: string) {
    const secret = await prisma.userSecret.findFirst({ where: { id: secretId, userId } });
    if (!secret) throw new Error('Secret not found');
    return secret;
  }

  private static encryptSecret(secret: string): string {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, Buffer.alloc(32, ENCRYPTION_KEY), iv);
      
      let encrypted = cipher.update(secret, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      const combined = `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
      
      return combined;
    } catch {
      throw new Error('Failed to encrypt secret');
    }
  }

  private static decryptSecret(encryptedSecret: string): string {
    try {
      const [ivHex, authTagHex, encrypted] = encryptedSecret.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      
      const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, Buffer.alloc(32, ENCRYPTION_KEY), iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch {
      throw new Error('Failed to decrypt secret');
    }
  }

  static async createSecret(userId: string, input: CreateSecretInput): Promise<UserSecretResponse> {
    if (!input.name || typeof input.name !== 'string') throw new Error('Secret name is required');
    if (!input.key || typeof input.key !== 'string') throw new Error('Secret value is required');
    if (input.name.length > 100) throw new Error('Secret name must be less than 100 characters');
    if (input.key.length > 10000) throw new Error('Secret value is too long');

    const existing = await prisma.userSecret.findFirst({ where: { userId, name: input.name } });
    if (existing) throw new Error(`Secret with name "${input.name}" already exists`);

    const secret = await prisma.userSecret.create({
      data: { userId, name: input.name, key: this.encryptSecret(input.key), label: input.label || '' },
    });
    return this.formatSecretResponse(secret);
  }

  static async listSecrets(userId: string) {
    const secrets = await prisma.userSecret.findMany({
      where: { userId },
      select: { id: true, name: true, label: true, key: true, createdAt: true, lastUsedAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return secrets.map((s: any) => ({
      id: s.id, name: s.name, label: s.label,
      keyPreview: this.getKeyPreview(s.key),
      createdAt: s.createdAt, lastUsedAt: s.lastUsedAt,
    }));
  }

  static async getSecret(userId: string, secretId: string): Promise<{ name: string; key: string }> {
    const secret = await this.requireSecret(userId, secretId);
    return { name: secret.name, key: this.decryptSecret(secret.key) };
  }

  static async updateSecret(userId: string, secretId: string, input: { name?: string; key?: string; label?: string }) {
    const secret = await this.requireSecret(userId, secretId);
    if (input.name && input.name !== secret.name) {
      const existing = await prisma.userSecret.findFirst({ where: { userId, name: input.name } });
      if (existing) throw new Error(`Secret with name "${input.name}" already exists`);
    }
    const updateData: any = {};
    if (input.name) updateData.name = input.name;
    if (input.key) updateData.key = this.encryptSecret(input.key);
    if (input.label !== undefined) updateData.label = input.label;
    const updated = await prisma.userSecret.update({ where: { id: secretId }, data: updateData });
    return this.formatSecretResponse(updated);
  }

  static async deleteSecret(userId: string, secretId: string): Promise<void> {
    await this.requireSecret(userId, secretId);
    await prisma.userSecret.delete({ where: { id: secretId } });
  }

  static async regenerateSecret(userId: string, secretId: string): Promise<{ key: string }> {
    await this.requireSecret(userId, secretId);
    const newKey = `sk_${crypto.randomBytes(32).toString('hex')}`;
    await prisma.userSecret.update({ where: { id: secretId }, data: { key: this.encryptSecret(newKey) } });
    return { key: newKey };
  }

  static async getSecretByName(userId: string, secretName: string): Promise<string | null> {
    try {
      const secret = await prisma.userSecret.findFirst({
        where: {
          userId,
          name: secretName,
        },
      });

      if (!secret) {
        return null;
      }

      // Update last used time
      await prisma.userSecret.update({
        where: { id: secret.id },
        data: { lastUsedAt: new Date() },
      });

      return this.decryptSecret(secret.key);
    } catch (error) {
      logger.error('GetByName error', error);
      return null;
    }
  }

  private static formatSecretResponse(secret: any) {
    return {
      id: secret.id,
      name: secret.name,
      label: secret.label || '',
      keyPreview: this.getKeyPreview(secret.key),
      createdAt: secret.createdAt,
      lastUsedAt: secret.lastUsedAt,
    };
  }

  private static getKeyPreview(encryptedKeyOrValue: string): string {
    let value = encryptedKeyOrValue;

    // Try to decrypt if it's encrypted
    try {
      value = this.decryptSecret(encryptedKeyOrValue);
    } catch {
      // If decryption fails, it's already plain text
    }

    if (value.length <= 4) {
      return '****';
    }

    return `****${value.slice(-4)}`;
  }
}
