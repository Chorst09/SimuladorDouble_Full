// src/hooks/use-auth.tsx
"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

// Importações e inicialização do Firebase Auth removidas
// import { getAuth, ... } from "firebase/auth";
// const app = getFirebaseApp();
// const auth = app ? getAuth(app) : null;

// Importações relacionadas ao Firestore podem ser mantidas se ainda usadas para outros propósitos
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";

// Definição do tipo AuthContextType e contexto removidos ou modificados
// interface AuthContextType { ... }
// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider e hook useAuth removidos ou modificados
// export const AuthProvider = ({ children }: { children: ReactNode }) => { ... };
// export const useAuth = () => { ... };

// Conteúdo do arquivo após a remoção do código de autenticação:
// Dependendo de como o restante do aplicativo usa este hook, pode ser necessário
// fornecer um hook dummy ou remover as chamadas para useAuth em outros lugares.
// Por enquanto, o arquivo estará quase vazio ou conterá apenas imports não relacionados à auth.

// Removendo completamente o conteúdo relacionado à autenticação e deixando o arquivo vazio ou com código não-auth.

// Deixando o arquivo vazio para desativar completamente a funcionalidade de autenticação.
