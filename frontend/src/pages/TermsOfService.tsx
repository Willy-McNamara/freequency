import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Container } from "../components/layout/Container";
import { Button } from "../components/ui/button";
import { CardContent, CardHeader } from "../components/ui/card";
import { ChevronLeft } from "lucide-react";
import { usePageTracking } from "../hooks/useAnalytics";

const TermsOfService: React.FC = () => {
  const navigate = useNavigate();
  const [docText, setDocText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Track page view for analytics
  usePageTracking("Terms of Service");

  useEffect(() => {
    const loadDoc = async () => {
      try {
        const resp = await fetch("/legal/terms.md", { cache: "no-store" });
        const text = await resp.text();
        setDocText(text);
      } catch {
        setDocText("Failed to load document. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    loadDoc();
  }, []);

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
    <div className="min-h-screen w-full flex flex-col items-center p-4 bg-background">
      <Container size="lg" className="py-8">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/login")}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Login
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-center">Terms of Service</h1>
        </CardHeader>
        <CardContent className="mt-4">
          {isLoading ? (
            <div className="text-center text-muted-foreground">Loading...</div>
          ) : (
            <div className="prose prose-sm max-w-none text-left">
              <div dangerouslySetInnerHTML={renderMarkdown(docText)} />
            </div>
          )}
        </CardContent>
      </Container>
    </div>
  );
};

export default TermsOfService;
