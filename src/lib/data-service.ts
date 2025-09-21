import fs from 'fs/promises';
import path from 'path';
import { User, Contract, SignatureData } from '@/types';
import { generateId } from './utils';

/**
 * Data service for handling JSON file-based storage operations
 */
export class DataService {
  private static readonly DATA_DIR = path.join(process.cwd(), 'src/data');
  private static readonly USERS_FILE = path.join(this.DATA_DIR, 'users.json');
  private static readonly CONTRACTS_FILE = path.join(this.DATA_DIR, 'contracts.json');

  /**
   * Reads and parses a JSON file
   * @param filePath - Path to the JSON file
   * @returns Parsed JSON data
   */
  private static async readJsonFile<T>(filePath: string): Promise<T> {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      throw new Error(`Failed to read data file`);
    }
  }

  /**
   * Writes data to a JSON file
   * @param filePath - Path to the JSON file
   * @param data - Data to write
   */
  private static async writeJsonFile<T>(filePath: string, data: T): Promise<void> {
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Error writing file ${filePath}:`, error);
      throw new Error(`Failed to write data file`);
    }
  }

  /**
   * Authenticates a user with email and password
   * @param email - User's email
   * @param password - User's password
   * @returns User object if authentication successful, null otherwise
   */
  static async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      const users = await this.readJsonFile<Array<User & { password: string }>>(this.USERS_FILE);
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
      
      return null;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  /**
   * Gets all contracts for a specific vendor (excludes deleted contracts)
   * @param vendorId - ID of the vendor
   * @returns Array of contracts
   */
  static async getContractsByVendor(vendorId: string): Promise<Contract[]> {
    try {
      const contracts = await this.readJsonFile<Contract[]>(this.CONTRACTS_FILE);
      return contracts.filter(contract => 
        contract.vendorId === vendorId && contract.status !== 'deleted'
      );
    } catch (error) {
      console.error('Error fetching contracts:', error);
      return [];
    }
  }

  /**
   * Creates a new contract
   * @param contractData - Contract data without ID and timestamps
   * @returns ID of the created contract
   */
  static async createContract(
    contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const contracts = await this.readJsonFile<Contract[]>(this.CONTRACTS_FILE);
      const now = new Date().toISOString();
      const newContract: Contract = {
        ...contractData,
        id: generateId('contract'),
        createdAt: now,
        updatedAt: now
      };

      contracts.push(newContract);
      await this.writeJsonFile(this.CONTRACTS_FILE, contracts);
      
      return newContract.id;
    } catch (error) {
      console.error('Error creating contract:', error);
      throw new Error('Failed to create contract');
    }
  }

  /**
   * Updates an existing contract
   * @param contractId - ID of the contract to update
   * @param updates - Partial contract data to update
   */
  static async updateContract(
    contractId: string,
    updates: Partial<Omit<Contract, 'id' | 'createdAt'>>
  ): Promise<void> {
    try {
      const contracts = await this.readJsonFile<Contract[]>(this.CONTRACTS_FILE);
      const contractIndex = contracts.findIndex(c => c.id === contractId);
      
      if (contractIndex === -1) {
        throw new Error('Contract not found');
      }

      contracts[contractIndex] = {
        ...contracts[contractIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await this.writeJsonFile(this.CONTRACTS_FILE, contracts);
    } catch (error) {
      console.error('Error updating contract:', error);
      throw new Error('Failed to update contract');
    }
  }

  /**
   * Gets a specific contract by ID
   * @param contractId - ID of the contract
   * @returns Contract object or null if not found
   */
  static async getContract(contractId: string): Promise<Contract | null> {
    try {
      const contracts = await this.readJsonFile<Contract[]>(this.CONTRACTS_FILE);
      return contracts.find(c => c.id === contractId) || null;
    } catch (error) {
      console.error('Error fetching contract:', error);
      return null;
    }
  }

  /**
   * Saves a signature to a contract
   * @param contractId - ID of the contract
   * @param signature - Signature data
   */
  static async saveSignature(contractId: string, signature: SignatureData): Promise<void> {
    try {
      await this.updateContract(contractId, {
        signature,
        status: 'signed'
      });
    } catch (error) {
      console.error('Error saving signature:', error);
      throw new Error('Failed to save signature');
    }
  }

  /**
   * Soft deletes a contract by marking it as deleted
   * @param contractId - ID of the contract to delete
   */
  static async deleteContract(contractId: string): Promise<void> {
    try {
      await this.updateContract(contractId, {
        status: 'deleted' as any
      });
    } catch (error) {
      console.error('Error deleting contract:', error);
      throw new Error('Failed to delete contract');
    }
  }
}