import React from "react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Container } from "../components/layout/Container";

const NotFound: React.FC = () => {
  return (
    <Container>
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-gray-800">
              404
            </CardTitle>
            <h2 className="text-xl font-semibold text-gray-600 mt-2">
              Page Not Found
            </h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-6">
              Sorry, the page you're looking for doesn't exist or has been
              moved.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/">Go to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
};

export default NotFound;
