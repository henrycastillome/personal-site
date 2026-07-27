import { MainLayout } from '@/components/layout/MainLayout';
import { PageSection } from '@/components/layout/PageSection';
import { LandingSection } from '@/components/sections/LandingSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { BackgroundSection } from '@/components/sections/BackgroundSection';
import { AboutMeSection } from '@/components/sections/AboutMeSection';
import { ContactSection } from '@/components/sections/ContactSection';
import type { PortfolioData } from '@/templates/types';

/**
 * Classic - the original portfolio design, now template #1.
 *
 * This is a straight move of what app/page.tsx used to render inline: the
 * sticky-nav shell over the five stacked sections. Nothing here changed
 * visually; it just became swappable. The section ids (home/projects/career/
 * aboutme/contact) are kept because the analytics scroll tracker observes them.
 */
export function ClassicTemplate({ data }: { data: PortfolioData }) {
  return (
    <MainLayout
      profileImage={data.hero?.profile_image}
      contactEmail={data.contact?.email}
      linkedinUrl={data.contact?.linkedin_url}
      githubUrl={data.contact?.github_url}
    >
      {/* Landing - extra top padding clears the fixed mobile menu */}
      <PageSection id="home" pt={{ base: '16', md: '24' }} pb="24">
        {data.hero && (
          <LandingSection
            content={data.hero}
            contactEmail={data.contact?.email}
            linkedinUrl={data.contact?.linkedin_url}
          />
        )}
      </PageSection>

      <PageSection id="projects" surface="frost">
        {data.projects.length > 0 && (
          <ProjectsSection
            projects={data.projects}
            heading={data.settings?.projects_heading}
          />
        )}
      </PageSection>

      <PageSection id="career">
        {data.workHistory.length > 0 && (
          <BackgroundSection
            workHistory={data.workHistory}
            heading={data.settings?.background_heading}
          />
        )}
      </PageSection>

      <PageSection id="aboutme" surface="frost">
        {data.about && <AboutMeSection content={data.about} />}
      </PageSection>

      <PageSection id="contact" pt={{ base: '24', md: '28' }} pb={{ base: '24', md: '28' }}>
        {data.contact && <ContactSection content={data.contact} />}
      </PageSection>
    </MainLayout>
  );
}
