import { useState } from "react";
import { useLocation } from "wouter";
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Welcome() {
  const [, setLocation] = useLocation();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleAuth = async (role: string) => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Create user in your backend
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: result.user.email,
          name: result.user.displayName,
          role,
        }),
      });

      setLocation("/home");
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = await createUserWithEmailAndPassword(auth, email, password);
        // Create user in backend
        await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: result.user.email,
            name: name || email.split("@")[0],
            role: "customer",
          }),
        });
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
      }

      setLocation("/home");
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-surface to-black flex flex-col items-center justify-center px-6">
        <Card className="w-full max-w-sm bg-surface border-gray-800">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-electric rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Zap className="w-8 h-8 text-black" />
              </div>
              <h1 className="text-2xl font-bold">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h1>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-black border-gray-600"
                    required
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black border-gray-600"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black border-gray-600"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-electric text-black font-semibold"
                disabled={loading}
              >
                {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </form>

            <div className="text-center mt-4">
              <Button
                variant="ghost"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-electric"
              >
                {isSignUp ? "Already have an account?" : "Need an account?"}
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={() => setShowLogin(false)}
              className="w-full mt-2"
            >
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-surface to-black flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Logo and Branding */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-electric rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <Zap className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl font-bold mb-2">WaltGarage</h1>
          <p className="text-gray-400 text-lg">Premium EV Service at Your Doorstep</p>
        </div>

        {/* Features Preview */}
        <div className="w-full max-w-sm space-y-4 mb-12">
          <div className="flex items-center space-x-4 p-4 bg-surface rounded-xl border border-gray-800">
            <div className="w-10 h-10 bg-electric/20 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-electric" />
            </div>
            <div>
              <div className="font-medium">Live Tracking</div>
              <div className="text-sm text-gray-400">Track your technician in real-time</div>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-surface rounded-xl border border-gray-800">
            <div className="w-10 h-10 bg-electric/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-electric" />
            </div>
            <div>
              <div className="font-medium">Quick Booking</div>
              <div className="text-sm text-gray-400">Book service in under 2 minutes</div>
            </div>
          </div>
        </div>

        {/* Auth Buttons */}
        <div className="w-full max-w-sm space-y-4">
          <Button 
            onClick={() => setShowRoleModal(true)} 
            className="w-full bg-electric text-black font-semibold py-4 rounded-2xl"
          >
            Get Started
          </Button>
          <Button 
            onClick={() => setShowLogin(true)} 
            variant="outline"
            className="w-full border-gray-600 text-white font-medium py-4 rounded-2xl"
          >
            Already have an account?
          </Button>
        </div>
      </div>

      {/* Role Selection Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-6 z-50">
          <Card className="w-full max-w-sm bg-surface border-gray-800">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-2 text-center">Choose Your Role</h2>
              <p className="text-gray-400 text-center mb-8">How would you like to use WaltGarage?</p>
              
              <div className="space-y-4">
                <Button
                  onClick={() => handleGoogleAuth("customer")}
                  disabled={loading}
                  className="w-full p-6 bg-electric/10 border border-electric rounded-2xl text-left hover:bg-electric/20"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-electric rounded-xl flex items-center justify-center">
                      <span className="text-black text-xl">👤</span>
                    </div>
                    <div>
                      <div className="font-semibold text-electric">Customer</div>
                      <div className="text-sm text-gray-400">Book EV services</div>
                    </div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => handleGoogleAuth("partner")}
                  disabled={loading}
                  className="w-full p-6 bg-surface-light border border-gray-700 rounded-2xl text-left hover:bg-gray-800"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-xl">🔧</span>
                    </div>
                    <div>
                      <div className="font-semibold">Partner</div>
                      <div className="text-sm text-gray-400">Provide EV services</div>
                    </div>
                  </div>
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={() => setShowRoleModal(false)}
                className="w-full mt-4"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
