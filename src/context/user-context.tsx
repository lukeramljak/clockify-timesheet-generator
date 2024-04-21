import React, { createContext, useContext, useEffect, useState } from "react";

type UserProviderProps = { children: React.ReactNode };

type User = {
  name?: string;
  userId?: string;
  workspaceId?: string;
  apiKey?: string;
};

export const UserContext = createContext<{
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}>({
  user: {},
  setUser: () => {},
});

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User>(
    JSON.parse(localStorage.getItem("user") || "{}"),
  );

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(user));
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};
