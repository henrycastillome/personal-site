import {
  LuLayoutTemplate,
  LuBriefcase,
  LuHistory,
  LuUser,
  LuMail,
  LuChartColumn,
  LuSwatchBook,
} from 'react-icons/lu';
import type { IconType } from 'react-icons';

/**
 * The admin section list, shared by the sidebar and the dashboard cards.
 *
 * Deliberately its own module with no 'use client': a server component that
 * imports a plain value from a client module receives a client-reference proxy
 * rather than the value itself, so `.map` would not exist on it.
 */
export interface AdminSection {
  href: string;
  label: string;
  blurb: string;
  icon: IconType;
}

export const ADMIN_SECTIONS: AdminSection[] = [
  {
    href: '/admin/hero',
    label: 'Hero',
    blurb: 'Greeting, headline, intro and buttons',
    icon: LuLayoutTemplate,
  },
  {
    href: '/admin/projects',
    label: 'Projects',
    blurb: 'Project cards',
    icon: LuBriefcase,
  },
  {
    href: '/admin/background',
    label: 'Background',
    blurb: 'Career timeline',
    icon: LuHistory,
  },
  {
    href: '/admin/about',
    label: 'About me',
    blurb: 'Bio, skills and photo',
    icon: LuUser,
  },
  {
    href: '/admin/contact',
    label: 'Contact',
    blurb: 'Email and links',
    icon: LuMail,
  },
  {
    href: '/admin/analytics',
    label: 'Analytics',
    blurb: 'Visits, locations and link clicks',
    icon: LuChartColumn,
  },
  {
    href: '/admin/templates',
    label: 'Templates',
    blurb: 'Switch your site design',
    icon: LuSwatchBook,
  },
];
