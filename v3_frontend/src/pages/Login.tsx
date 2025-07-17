import React from "react";
import { useAuth } from "../components/auth/AuthProvider";
import { Button } from "../components/ui/button";
import { CardContent, CardHeader } from "../components/ui/card";
import { Container } from "../components/layout/Container";
import FreequencyLogo from "../assets/freequency-logo-w-name-draft.svg";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

const Login: React.FC = () => {
  const { login } = useAuth();
  const [modal, setModal] = useState<null | "terms" | "privacy">(null);

  const handleGoogleLogin = () => {
    // In development, use debug parameter
    if (import.meta.env.DEV) {
      window.location.href = "http://localhost:3000/auth/login?debug=true";
    } else {
      login();
    }
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
                href="#"
                className="text-primary hover:underline cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  setModal("terms");
                }}
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="text-primary hover:underline cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  setModal("privacy");
                }}
              >
                Privacy Policy
              </a>
            </p>
          </div>
        </CardContent>
        <Dialog open={modal !== null} onOpenChange={() => setModal(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {modal === "terms" ? "Terms of Service" : "Privacy Policy"}
              </DialogTitle>
            </DialogHeader>
            <div className="prose max-w-none text-left text-sm">
              {modal === "terms" ? (
                <>
                  <h2>Mock Terms of Service</h2>
                  <p>
                    Welcome to Freequency! By using our app, you agree to the
                    following terms:
                  </p>
                  <ul>
                    <li>You will use the app for lawful purposes only.</li>
                    <li>
                      You are responsible for the content you upload and share.
                    </li>
                    <li>
                      We may update these terms at any time. Continued use means
                      you accept the changes.
                    </li>
                    <li>
                      We are not liable for any damages or losses from using the
                      app.
                    </li>
                  </ul>
                  <p>For questions, contact support@freequency.app</p>
                </>
              ) : (
                <>
                  <h2>Mock Privacy Policy</h2>
                  <p>
                    Your privacy is important to us. Here's how we handle your
                    data:
                  </p>
                  <ul>
                    <li>
                      We collect only the information needed to provide our
                      service.
                    </li>
                    <li>Your data is never sold to third parties.</li>
                    <li>
                      You can request deletion of your account and data at any
                      time.
                    </li>
                    <li>
                      We use industry-standard security to protect your
                      information.
                    </li>
                  </ul>
                  <p>For questions, contact privacy@freequency.app</p>
                </>
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
