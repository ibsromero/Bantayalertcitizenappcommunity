import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, Info, Loader2, Building2, UserCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { toast } from "sonner@2.0.3";
import { signIn, signUp } from "../utils/supabaseClient";
import { ForgotPasswordDialog } from "./ForgotPasswordDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export type UserType = "citizen" | "department";
export type DepartmentRole = "lgu" | "emergency_responder" | "healthcare" | "disaster_management";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, name: string, accessToken?: string, userType?: UserType, departmentRole?: DepartmentRole) => void;
}

// Department credentials
const DEPARTMENT_CREDENTIALS = {
  lgu: { email: "lgu@bantayalert.ph", password: "LGU2025!Manila", name: "LGU Administrator" },
  emergency_responder: { email: "responder@bantayalert.ph", password: "RESP2025!911", name: "Emergency Responder" },
  healthcare: { email: "healthcare@bantayalert.ph", password: "HEALTH2025!Care", name: "Healthcare Provider" },
  disaster_management: { email: "ndrrmc@bantayalert.ph", password: "NDRRMC2025!PH", name: "Disaster Management" }
};

export function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [userType, setUserType] = useState<UserType>("citizen");
  const [departmentRole, setDepartmentRole] = useState<DepartmentRole>("lgu");
  const [loginForm, setLoginForm] = useState({ email: "demo@bantayalert.ph", password: "demo123" });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check for department credentials
      if (userType === "department") {
        try {
          // Validate that the email/password match the selected department role
          const expectedCredentials = DEPARTMENT_CREDENTIALS[departmentRole];
          
          if (loginForm.email !== expectedCredentials.email || loginForm.password !== expectedCredentials.password) {
            toast.error("Invalid credentials for selected department", {
              description: `Please use the correct email and password for ${expectedCredentials.name}`,
            });
            setIsLoading(false);
            return;
          }
          
          const { projectId, publicAnonKey } = await import("../utils/supabase/info");
          
          // Try client-side auth first (temporary workaround for server deployment issues)
          const { clientSideDepartmentSignIn } = await import("../utils/clientSideDepartmentAuth");
          const clientResult = await clientSideDepartmentSignIn(loginForm.email, loginForm.password);
          
          if (!clientResult.success || !clientResult.session) {
            toast.error("Invalid department credentials", {
              description: "Please check your email and password",
            });
            setIsLoading(false);
            return;
          }

          console.log("✅ Department login successful:", {
            name: clientResult.session.name,
            role: clientResult.session.role,
            department: clientResult.session.department,
            tokenPrefix: clientResult.session.token?.substring(0, 20) + '...',
            tokenHasPeriod: clientResult.session.token?.includes('.'),
            tokenLength: clientResult.session.token?.length,
            tokenParts: clientResult.session.token?.substring(5).split(".").length
          });

          // Store session token
          console.log("Calling onLogin with department credentials...");
          onLogin(
            clientResult.session.email, 
            clientResult.session.name, 
            clientResult.session.token, 
            "department", 
            clientResult.session.role
          );
          
          toast.success(`Welcome ${clientResult.session.name}!`, {
            description: `Signed in to ${clientResult.session.department} (Client Auth)`,
          });
          onClose();
          setIsLoading(false);
          return;
        } catch (error) {
          console.error("Department signin error:", error);
          toast.error("Sign-in failed", {
            description: "Could not connect to server. Please try again.",
          });
          setIsLoading(false);
          return;
        }
      }

      // Citizen login
      // Demo credentials for testing
      if (loginForm.email === "demo@bantayalert.ph" && loginForm.password === "demo123") {
        onLogin(loginForm.email, "Juan Dela Cruz", undefined, "citizen");
        toast.success("Welcome back!", {
          description: "Successfully signed in to BantayAlert (Demo Mode)",
        });
        onClose();
        setIsLoading(false);
        return;
      }

      // Try real Supabase authentication
      const { data, error } = await signIn(loginForm.email, loginForm.password);

      if (error) {
        toast.error("Login failed", {
          description: "Invalid email or password. Please try again or sign up for a new account.",
        });
      } else if (data?.session) {
        const userName = data.user.user_metadata?.name || data.user.email?.split('@')[0] || "User";
        onLogin(data.user.email || "", userName, data.session.access_token, "citizen");
        toast.success("Welcome back!", {
          description: "Successfully signed in to BantayAlert",
        });
        onClose();
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed", {
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error("Passwords don't match", {
        description: "Please make sure both passwords are the same",
      });
      return;
    }
    
    if (signupForm.password.length < 6) {
      toast.error("Password too short", {
        description: "Password must be at least 6 characters",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Use Supabase auth signup
      const { data, error } = await signUp(signupForm.email, signupForm.password, signupForm.name);

      if (error) {
        console.error("Signup error:", error);
        
        // Check if user already exists
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes("already registered") || errorMessage.includes("already exists")) {
          toast.error("Account already exists", {
            description: "An account with this email already exists. Please sign in instead.",
          });
        } else {
          toast.error("Signup failed", {
            description: errorMessage || "Could not create account. Please try again.",
          });
        }
      } else if (data?.user) {
        // Signup successful - check if we have a session (auto-confirm) or need email confirmation
        if (data.session) {
          // Auto-confirmed - log in immediately
          onLogin(signupForm.email, signupForm.name, data.session.access_token, "citizen");
          toast.success("Account created!", {
            description: "Welcome to BantayAlert!",
          });
          onClose();
        } else {
          // Email confirmation required
          toast.success("Account created!", {
            description: "Please check your email to verify your account, then sign in.",
          });
          onClose();
        }
      } else {
        toast.error("Signup failed", {
          description: "An unexpected error occurred. Please try again.",
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Signup failed", {
        description: "Could not create account. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to BantayAlert</DialogTitle>
          <DialogDescription>
            Sign in to sync your emergency plans across all devices
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="login" className="text-sm sm:text-base">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="text-sm sm:text-base">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Enter your credentials to access your emergency plans
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* User Type Selection */}
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={userType === "citizen" ? "default" : "outline"}
                      className="w-full"
                      onClick={() => {
                        setUserType("citizen");
                        setLoginForm({ email: "", password: "" });
                      }}
                    >
                      <UserCircle className="mr-2 h-4 w-4" />
                      Citizen
                    </Button>
                    <Button
                      type="button"
                      variant={userType === "department" ? "default" : "outline"}
                      className="w-full"
                      onClick={() => {
                        setUserType("department");
                        setLoginForm({ email: "", password: "" });
                      }}
                    >
                      <Building2 className="mr-2 h-4 w-4" />
                      Department
                    </Button>
                  </div>
                </div>

                {/* Department Role Selection */}
                {userType === "department" && (
                  <div className="space-y-2">
                    <Label htmlFor="department-role">Department Role</Label>
                    <Select value={departmentRole} onValueChange={(value: DepartmentRole) => {
                      setDepartmentRole(value);
                    }}>
                      <SelectTrigger id="department-role">
                        <SelectValue placeholder="Select your department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lgu">LGU Administrator</SelectItem>
                        <SelectItem value="emergency_responder">Emergency Responder</SelectItem>
                        <SelectItem value="healthcare">Healthcare Provider</SelectItem>
                        <SelectItem value="disaster_management">Disaster Management (NDRRMC)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Contact your department administrator for credentials
                    </p>
                  </div>
                )}
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        autoComplete="off"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-10 pr-10"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        autoComplete="off"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent touch-manipulation min-w-[44px] active:scale-95 transition-transform"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full touch-manipulation min-h-[44px] active:scale-95 transition-transform" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="touch-manipulation min-h-[40px] active:scale-95 transition-transform"
                    onClick={() => setShowForgotPassword(true)}
                    type="button"
                  >
                    Forgot your password?
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Create a new account to start building your emergency plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        className="pl-10"
                        value={signupForm.name}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className="pl-10 pr-10"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent touch-manipulation min-w-[44px] active:scale-95 transition-transform"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-confirm"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="pl-10"
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full touch-manipulation min-h-[44px] active:scale-95 transition-transform" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>

                <p className="text-xs text-gray-500 text-center">
                  By creating an account, you agree to our Terms of Service and Privacy Policy
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>

      <ForgotPasswordDialog
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </Dialog>
  );
}