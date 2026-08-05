"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";

export function useIsLoggedIn() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const client = supabase();

  useEffect(() => {
    client.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));
  }, []);

  return isLoggedIn;
}
