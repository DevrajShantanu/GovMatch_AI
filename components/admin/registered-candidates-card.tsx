"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Search, Mail, UserIcon, ShieldCheck } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Profile } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface RegisteredCandidatesCardProps {
  userCount: number;
  profiles: Profile[];
}

export function RegisteredCandidatesCard({ userCount, profiles }: RegisteredCandidatesCardProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProfiles = useMemo(() => {
    if (!searchQuery) return profiles;
    const lowerQuery = searchQuery.toLowerCase();
    return profiles.filter(
      (p) =>
        p.full_name?.toLowerCase().includes(lowerQuery) ||
        p.email?.toLowerCase().includes(lowerQuery) ||
        p.role?.toLowerCase().includes(lowerQuery)
    );
  }, [profiles, searchQuery]);

  return (
    <>
      <Card 
        onClick={() => setOpen(true)}
        className="p-5 space-y-2 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50 border-outline-variant/40 dark:border-slate-800 shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-900/50 transition-all duration-300"
      >
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/30 group-hover:scale-150 transition-all duration-500" />
        <div className="flex justify-between items-start relative z-10">
          <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
            <Users className="h-5 w-5" />
          </span>
          <Badge variant="outline" className="bg-white/50 dark:bg-slate-900/50 text-[10px] shadow-sm">Active</Badge>
        </div>
        <div className="relative z-10">
          <p className="text-3xl font-black text-on-surface dark:text-white mt-2 group-hover:scale-[1.02] origin-left transition-transform duration-300">{userCount}</p>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Registered Candidates</p>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Registered Candidates Directory
          </DialogTitle>
          <DialogDescription>
            Browse and manage all registered users on the GovMatch platform.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by name, email, or role..." 
            className="pl-9 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="mt-4 max-h-[50vh] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          <AnimatePresence mode="popLayout">
            {filteredProfiles.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-8 text-slate-500"
              >
                <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-full mb-3">
                  <Search className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium">No candidates found.</p>
                <p className="text-xs text-slate-400">Try adjusting your search query.</p>
              </motion.div>
            ) : (
              filteredProfiles.map((profile, idx) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.05 } }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.01 }}
                  key={profile.id} 
                  className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/50 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 overflow-hidden">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-sm uppercase">{profile.full_name?.charAt(0) || "U"}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {profile.full_name || "Unknown User"}
                      </span>
                      {profile.role === "ADMIN" && (
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{profile.email}</span>
                    </div>
                  </div>

                  {profile.role && (
                    <Badge variant="secondary" className="text-[10px] shrink-0 font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {profile.role}
                    </Badge>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </Dialog>
    </>
  );
}
