import type { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "../ui/Card.js";

export interface ContentCardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function ContentCard({
  title,
  subtitle,
  action,
  children,
  className,
  noPadding = false,
}: ContentCardProps): JSX.Element {
  return (
    <Card className={className}>
      <CardHeader title={title} subtitle={subtitle} action={action} />
      {noPadding ? children : <CardContent>{children}</CardContent>}
    </Card>
  );
}
