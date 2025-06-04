import React, { useState, useMemo } from "react";
import { Ticket, Event } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpDown,
  TrendingUp,
  MapPin,
  Clock,
  Users,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface TicketComparisonProps {
  tickets: Ticket[];
  event: Event;
  onSelectTicket?: (ticket: Ticket) => void;
}

interface TicketAnalysis {
  totalAvailable: number;
  trending: boolean;
}

export function TicketComparison({
  tickets,
  event,
  onSelectTicket,
}: TicketComparisonProps) {
  const [sortBy, setSortBy] = useState<"section">("section");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const analysis = useMemo((): TicketAnalysis => {
    if (tickets.length === 0) {
      return {
        totalAvailable: 0,
        trending: false,
      };
    }

    const totalAvailable = tickets.reduce((sum, t) => sum + t.quantity, 0);
    const trending = event.trending ?? false;

    return {
      totalAvailable,
      trending,
    };
  }, [tickets, event]);

  const sortedTickets = useMemo(() => {
    return [...tickets].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "section":
          comparison = a.section.localeCompare(b.section);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [tickets, sortBy, sortOrder]);

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
  };

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No tickets available for comparison</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Ticket Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analysis.totalAvailable}
              </div>
              <div className="text-sm text-gray-500">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {tickets.length}
              </div>
              <div className="text-sm text-gray-500">Listings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(tickets.map(t => t.section)).size}
              </div>
              <div className="text-sm text-gray-500">Sections</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                {analysis.trending && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Trending
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sorting Controls */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={sortBy === "section" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSort("section")}
          className="flex items-center gap-1"
        >
          <ArrowUpDown className="h-3 w-3" />
          Section
          {sortBy === "section" && (
            <span className="text-xs">
              {sortOrder === "asc" ? "↑" : "↓"}
            </span>
          )}
        </Button>
      </div>

      {/* Ticket List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedTickets.map((ticket, index) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{ticket.section}</h3>
                      {ticket.row && (
                        <p className="text-sm text-gray-600">
                          Row {ticket.row}
                          {ticket.seat && `, Seat ${ticket.seat}`}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={ticket.status === "available" ? "default" : "secondary"}
                      className={
                        ticket.status === "available"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {ticket.status}
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Quantity: {ticket.quantity}</span>
                    </div>
                    
                    {ticket.transferMethod && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>Transfer: {ticket.transferMethod}</span>
                      </div>
                    )}
                    
                    {ticket.additionalInfo && (
                      <div className="text-xs text-gray-500 mt-2">
                        {ticket.additionalInfo}
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  {onSelectTicket && (
                    <Button
                      onClick={() => onSelectTicket(ticket)}
                      className="w-full"
                      size="sm"
                    >
                      Contact Seller
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}