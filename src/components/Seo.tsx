import { ReactNode } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";

/**
 * Page-head tags (title, description, canonical) for one screen.
 *
 * Use this instead of importing Helmet directly. It owns its own
 * HelmetProvider, so the tags always have a context to register with.
 * A bare Helmet that ends up without a matching provider throws
 * "Cannot read properties of undefined (reading 'add')" while rendering
 * and blanks the whole screen.
 */
export const Seo = ({ children }: { children: ReactNode }) => (
  <HelmetProvider>
    <Helmet>{children}</Helmet>
  </HelmetProvider>
);
