import { useState } from "react";
import { Bell, Menu, Settings, User, LogOut, Phone, Package, MapPin, BookOpen, ListChecks, CloudRain, X, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { AuthModal } from "./AuthModal";
import type { UserType, DepartmentRole } from "./AuthModal";
import { NotificationsDialog } from "./NotificationsDialog";
import { SettingsHub } from "./SettingsHub";
import { ProfileDialog } from "./ProfileDialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./ui/sheet";
import { SOSButton } from "./SOSButton";

interface HeaderProps {
  user: { name: string; email: string; accessToken?: string; userType?: UserType; departmentRole?: DepartmentRole } | null;
  onLogin: (email: string, name: string, accessToken?: string, userType?: UserType, departmentRole?: DepartmentRole) => void;
  onLogout: () => void;
  onNavigate?: (section: string) => void;
}

export function Header({ user, onLogin, onLogout, onNavigate }: HeaderProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleMenu = () => {
    setShowSidebar(true);
  };

  const handleNavigateAndClose = (section: string) => {
    onNavigate?.(section);
    setShowSidebar(false);
  };

  const handleNotifications = () => {
    setShowNotifications(true);
  };

  const handleProfile = () => {
    setShowProfile(true);
    setShowSidebar(false);
  };

  const handleProfileUpdate = (name: string) => {
    // Update the local user state with new name
    if (user) {
      onLogin(user.email, name, user.accessToken, user.userType, user.departmentRole);
    }
  };

  const handleSettings = () => {
    setShowSettings(true);
    setShowSidebar(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="touch-manipulation min-h-[44px] min-w-[44px] active:scale-95 transition-transform"
              onClick={handleMenu}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">BantayAlert</h1>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Quick SOS Button - always visible for citizen view */}
            {user?.userType !== "department" && (
              <div className="hidden sm:block">
                <SOSButton user={user} />
              </div>
            )}
            
            {user && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative touch-manipulation min-h-[44px] min-w-[44px] active:scale-95 transition-transform"
                onClick={handleNotifications}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </Button>
            )}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 px-2 touch-manipulation min-h-[44px] active:scale-95 transition-transform">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={user.name} />
                      <AvatarFallback className="text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleProfile}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSettings}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setShowAuthModal(true)}
                className="touch-manipulation min-h-[40px] px-4 active:scale-95 transition-transform"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={onLogin}
      />

      <NotificationsDialog
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      <SettingsHub
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        user={user}
      />

      <ProfileDialog
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        user={user}
        onProfileUpdate={handleProfileUpdate}
      />

      <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>BantayAlert</SheetTitle>
            <SheetDescription>
              Emergency Response System
            </SheetDescription>
          </SheetHeader>
          
          {/* SOS Button in Sidebar - only for citizen view */}
          {user?.userType !== "department" && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex flex-col items-center space-y-2">
                <p className="text-xs text-red-900 font-medium text-center">Emergency Alert</p>
                <SOSButton user={user} />
              </div>
            </div>
          )}
          
          <div className="mt-6 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start touch-manipulation min-h-[48px]"
              onClick={() => handleNavigateAndClose("emergency")}
            >
              <Phone className="h-5 w-5 mr-3" />
              Emergency Contacts
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start touch-manipulation min-h-[48px]"
              onClick={() => handleNavigateAndClose("checklist")}
            >
              <ListChecks className="h-5 w-5 mr-3" />
              Preparation Checklist
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start touch-manipulation min-h-[48px]"
              onClick={() => handleNavigateAndClose("kit")}
            >
              <Package className="h-5 w-5 mr-3" />
              Emergency Kit
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start touch-manipulation min-h-[48px]"
              onClick={() => handleNavigateAndClose("alerts")}
            >
              <CloudRain className="h-5 w-5 mr-3" />
              Weather Alerts
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start touch-manipulation min-h-[48px]"
              onClick={() => handleNavigateAndClose("evacuation")}
            >
              <MapPin className="h-5 w-5 mr-3" />
              Evacuation Routes
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start touch-manipulation min-h-[48px]"
              onClick={() => handleNavigateAndClose("resources")}
            >
              <BookOpen className="h-5 w-5 mr-3" />
              Resources
            </Button>
          </div>

          {user && (
            <div className="absolute bottom-6 left-6 right-6 space-y-2 border-t pt-4">
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start touch-manipulation min-h-[44px]"
                onClick={handleSettings}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start touch-manipulation min-h-[44px]"
                onClick={() => {
                  onLogout();
                  setShowSidebar(false);
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}