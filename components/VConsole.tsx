"use client";
import { useEffect } from 'react';

export default function VConsole() {
  useEffect(() => {
    // 在客户端加载 vconsole
    if (typeof window !== 'undefined') {
      import('vconsole').then((VConsole) => {
        new VConsole.default();
      });
    }
  }, []);

  return null;
}