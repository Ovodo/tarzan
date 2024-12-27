"use client";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "../lib/store";
import { fetchMarketPlace } from "../lib/slices/marketSlice";
import { useRef } from "react";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
    storeRef.current.dispatch(fetchMarketPlace());
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}