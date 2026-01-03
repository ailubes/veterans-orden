/**
 * Regional Adapter
 *
 * Provides a centralized interface for accessing regional structure,
 * whether it's oblasts or commanderies.
 */

import { regionalConfig } from '@/../../config/regional.config';

export class RegionalAdapter {
  /**
   * Get all regional units
   */
  static getUnits() {
    return regionalConfig.units;
  }

  /**
   * Get a specific unit by code
   */
  static getUnit(code: string) {
    return regionalConfig.units.find((unit) => unit.code === code);
  }

  /**
   * Get units by type
   */
  static getUnitsByType(type: 'commandery' | 'city' | 'oblast') {
    return regionalConfig.units.filter((unit) => unit.type === type);
  }

  /**
   * Get child units (for hierarchical structures)
   */
  static getChildUnits(parentCode: string) {
    return regionalConfig.units.filter((unit) => unit.parent === parentCode);
  }

  /**
   * Get UI labels
   */
  static getLabels() {
    return regionalConfig.labels;
  }

  /**
   * Get label by key
   */
  static getLabel(key: keyof typeof regionalConfig.labels): string {
    return regionalConfig.labels[key];
  }

  /**
   * Get database table name
   */
  static getTableName(): string {
    return regionalConfig.tableName;
  }

  /**
   * Get database relation field name
   */
  static getRelationField(): string {
    return regionalConfig.relationField;
  }

  /**
   * Get regional structure type
   */
  static getStructureType() {
    return regionalConfig.type;
  }

  /**
   * Check if using commanderies structure
   */
  static isCommanderies(): boolean {
    return regionalConfig.type === 'commanderies';
  }

  /**
   * Check if using oblasts structure
   */
  static isOblasts(): boolean {
    return regionalConfig.type === 'oblasts';
  }
}
