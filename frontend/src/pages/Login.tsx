import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../components/auth/AuthProvider";
import { Button } from "../components/ui/button";
import { CardContent, CardHeader } from "../components/ui/card";
import { Container } from "../components/layout/Container";
import FreequencyLogo from "../assets/freequency-logo-w-name-draft.svg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { usePageTracking } from "../hooks/useAnalytics";
import packageJson from "../../package.json";

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
        <strong>Task Library</strong> you can see <strong>Tasks</strong> made by
        musicians across the platform and make your own! You can add them to
        your practice session where you'll be able to save Task-specific notes
        and tags.
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
        musician and edit some basic data. See other user's profiles by
        searching for them or clicking their name in posts and tasks.
      </>
    ),
  },
];

const Login: React.FC = () => {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [modal, setModal] = useState<null | "terms" | "privacy" | "about">(
    null
  );
  const [docText, setDocText] = useState<string>("");

  // Track page view for analytics
  usePageTracking("Login");

  const handleGoogleLogin = () => {
    // In development, use debug parameter
    if (import.meta.env.DEV) {
      window.location.href = "http://localhost:3000/auth/login?debug=true";
    } else {
      login();
    }
  };

  // Handle URL-based modal opening
  useEffect(() => {
    const path = location.pathname;
    if (path === "/login/termsofservice") {
      setModal("terms");
    } else if (path === "/login/privacypolicy") {
      setModal("privacy");
    } else {
      setModal(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    const loadDoc = async () => {
      if (!modal) return;
      const path = modal === "terms" ? "/legal/terms.md" : "/legal/privacy.md";
      try {
        const resp = await fetch(path, { cache: "no-store" });
        const text = await resp.text();
        setDocText(text);
      } catch {
        setDocText("Failed to load document. Please try again later.");
      }
    };
    loadDoc();
  }, [modal]);

  const renderMarkdown = (md: string) => {
    // Minimal markdown to HTML conversion for headings/paragraphs/lists.
    // This keeps bundle small and avoids adding a new dependency.
    let html = md
      .replace(/^###\s(.+)$/gim, "<h3>$1</h3>")
      .replace(/^##\s(.+)$/gim, "<h2>$1</h2>")
      .replace(/^#\s(.+)$/gim, "<h1>$1</h1>")
      .replace(/^-\s(.+)$/gim, "<li>$1</li>")
      .replace(/^\*\*(.+)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*\*(.+?)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/gim, "<em>$1</em>")
      .replace(/\n\n/g, "<br/><br/>");

    // Wrap loose list items into <ul>
    html = html.replace(
      /(<li>[^<]*<\/li>\s*)+/gim,
      (match) => `<ul>${match}</ul>`
    );

    return { __html: html };
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
      <Container
        size="sm"
        className="flex flex-col items-center justify-center"
      >
        {/* <Card className="w-full max-w-md"> */}
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex flex-col items-center pb-5">
            <img
              src={FreequencyLogo}
              alt="Freequency logo"
              className="w-80 h-auto mb-2"
            />
            <p className="text-sm text-gray-600 mt-1">celebrate practice</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => setModal("about")}
            className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            variant="outline"
          >
            About
          </Button>
          <Button
            onClick={handleGoogleLogin}
            className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            variant="outline"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Login or sign up with Google
          </Button>

          <div className="text-center text-sm text-gray-600">
            <p>By continuing, you agree to our</p>
            <p>
              <a
                href="/login/termsofservice"
                className="text-primary hover:underline cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login/termsofservice");
                }}
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/login/privacypolicy"
                className="text-primary hover:underline cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login/privacypolicy");
                }}
              >
                Privacy Policy
              </a>
            </p>
          </div>
        </CardContent>
        <Dialog
          open={modal !== null}
          onOpenChange={(open) => {
            if (!open) {
              // Navigate back to /login when modal is closed
              navigate("/login");
            }
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {modal === "terms"
                  ? "Terms of Service"
                  : modal === "privacy"
                  ? "Privacy Policy"
                  : "Welcome!"}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-2 max-h-[70vh] overflow-y-auto pr-2">
              {modal === "about" ? (
                <div className="space-y-6">
                  {aboutSections.map((section) => (
                    <div key={section.title} className="space-y-2">
                      <h3 className="text-lg font-semibold text-primary">
                        {section.title}
                      </h3>
                      <p className="text-base">{section.content}</p>
                    </div>
                  ))}
                  <p className="text-muted-foreground mt-8 text-sm text-center">
                    Version {packageJson.version} &mdash; &copy;{" "}
                    {new Date().getFullYear()} Freequency
                  </p>
                </div>
              ) : (
                <div className="prose max-w-none text-left text-sm">
                  <div dangerouslySetInnerHTML={renderMarkdown(docText)} />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        {/* </Card> */}
      </Container>
    </div>
  );
};

export default Login;
