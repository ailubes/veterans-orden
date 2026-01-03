/**
 * Content Adapter
 *
 * Provides a centralized interface for accessing organization-specific content,
 * branding, and configuration throughout the application.
 */

import { organizationConfig } from '@/../../config/organization.config';

export class ContentAdapter {
  /**
   * Get organization name
   */
  static getOrgName(variant: 'full' | 'short' | 'english' = 'full'): string {
    return organizationConfig.name[variant];
  }

  /**
   * Get mission/tagline
   */
  static getMission(field: 'statement' | 'tagline' | 'description'): string {
    return organizationConfig.mission[field];
  }

  /**
   * Get navigation links
   */
  static getNavigation() {
    return organizationConfig.navigation;
  }

  /**
   * Get social media links
   */
  static getSocialLinks() {
    return organizationConfig.social;
  }

  /**
   * Get contact information
   */
  static getContact() {
    return organizationConfig.contact;
  }

  /**
   * Get legal information
   */
  static getLegal() {
    return organizationConfig.legal;
  }

  /**
   * Get member goal
   */
  static getMemberGoal(): number {
    return organizationConfig.memberGoal;
  }

  /**
   * Get milestones
   */
  static getMilestones() {
    return organizationConfig.milestones;
  }

  /**
   * Get domain
   */
  static getDomain(): string {
    return organizationConfig.domain;
  }

  /**
   * Get URLs
   */
  static getUrls() {
    return organizationConfig.urls;
  }

  /**
   * Get locale settings
   */
  static getLocale() {
    return {
      locale: organizationConfig.locale,
      currency: organizationConfig.currency,
      timezone: organizationConfig.timezone,
    };
  }

  /**
   * Get full organization config (use sparingly)
   */
  static getFullConfig() {
    return organizationConfig;
  }
}
