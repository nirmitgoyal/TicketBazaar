import React, { createContext, useContext, useState, ReactNode } from "react";
import { Event } from "@shared/schema";
import { EventAtmosphere } from "@/components/event-atmosphere";

interface AtmosphereContextType {
  activeEvent: Event | null;
  setActiveEvent: (event: Event | null) => void;
  isAtmosphereActive: boolean;
}

const AtmosphereContext = createContext<AtmosphereContextType | undefined>(
  undefined,
);

export const useAtmosphereContext = () => {
  const context = useContext(AtmosphereContext);
  if (!context) {
    throw new Error(
      "useAtmosphereContext must be used within AtmosphereProvider",
    );
  }
  return context;
};

interface AtmosphereProviderProps {
  children: ReactNode;
}

export const AtmosphereProvider: React.FC<AtmosphereProviderProps> = ({
  children,
}) => {
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const isAtmosphereActive = activeEvent !== null;

  return (
    <AtmosphereContext.Provider
      value={{ activeEvent, setActiveEvent, isAtmosphereActive }}
    >
      {children}
      <EventAtmosphere event={activeEvent} isActive={isAtmosphereActive} />
    </AtmosphereContext.Provider>
  );
};
