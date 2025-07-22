import { Container } from "../components/layout/Container";
import { Section } from "../components/layout/Section";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const aboutSections = [
  {
    title: "What is Freequency?",
    content: (
      <>
        <strong>Freequency</strong> is a platform designed to help musicians
        track their practice and celebrate it with their community.
      </>
    ),
  },
  {
    title: "Practice Sessions",
    content: (
      <>
        Whenever you practice, start a session in the <strong>Practice</strong>{" "}
        tab. You can keep notes in the session, add trackable tags, and use
        "Tasks".
      </>
    ),
  },
  {
    title: "Tasks & Task Library",
    content: (
      <>
        Tasks are repeatable parts of your practice routine. In the{" "}
        <strong>Task Library</strong> you can see Tasks made by musicians across
        the platform and make your own! You can add them to your session where
        you'll be able to save Task-specific notes and tags.
      </>
    ),
  },
  {
    title: "Feed & Growth",
    content: (
      <>
        Check out sessions from your fellow musicians in the filterable{" "}
        <strong>Feed</strong>, and visit the <strong>Growth</strong> page to set
        goals or see stats around your practice time (tracked using the tags!).
      </>
    ),
  },
  {
    title: "Profile",
    content: (
      <>
        Visit the <strong>Profile</strong> page to describe who you are as a
        musician and edit some basic data. You can visit other user's profiles
        by clicking their name when you view a post of theirs.
      </>
    ),
  },
];

export default function About() {
  return (
    <Container size="md" className="py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Welcome!</h1>
      {aboutSections.map((section) => (
        <Section key={section.title} spacing={{ base: "md", md: "lg" }}>
          <Card className="mx-auto max-w-xl">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl text-primary text-center md:text-left">
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-base md:text-lg">
              {section.content}
            </CardContent>
          </Card>
        </Section>
      ))}
      <p className="text-muted-foreground mt-8 text-sm text-center">
        Version 1.0.0 &mdash; &copy; {new Date().getFullYear()} Freequency
      </p>
    </Container>
  );
}
