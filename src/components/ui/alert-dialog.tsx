'use client';

import * as React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      // Visual backdrop: do not capture pointer events so clicks reach the dialog
      'pointer-events-none fixed inset-0 z-[1000000] bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
    ref={ref}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      // Icon on the left, title + description on the right; description will naturally wrap to next line
      'flex items-start gap-3 text-left',
      className
    )}
    {...props}
  />
);
AlertDialogHeader.displayName = 'AlertDialogHeader';

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      // Mobile: show Cancel button and Delete text side-by-side; add top margin for spacing
      'mt-4 flex w-full flex-row items-center justify-between gap-4 sm:mt-0 sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
);
AlertDialogFooter.displayName = 'AlertDialogFooter';

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />

      {/* Render mobile-specific popup (not a bottom sheet) to avoid interaction issues */}
      {isMobile ? (
        <AlertDialogPrimitive.Content
          ref={ref}
          {...props}
          style={{ pointerEvents: 'auto' }}
          className={cn(
            // mobile-centered compact popup
            'fixed left-1/2 top-1/2 z-[1000001] w-[90vw] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-4 shadow-2xl',
            className
          )}
        >
          <div className="pointer-events-auto">{children}</div>
        </AlertDialogPrimitive.Content>
      ) : (
        <AlertDialogPrimitive.Content
          ref={ref}
          {...props}
          style={{ pointerEvents: 'auto' }}
          className={cn(
            // desktop modal
            'fixed left-[50%] top-[50%] z-[1000001] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg',
            className
          )}
        >
          <div className="pointer-events-auto">{children}</div>
        </AlertDialogPrimitive.Content>
      )}
    </AlertDialogPortal>
  );
});

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold', className)}
    {...props}
  />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName;

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const desktopClasses = buttonVariants();

  if (isMobile) {
    // Render a text-only destructive action on mobile and ignore incoming className
    // Use `asChild` so Radix will handle action semantics while we control markup
    const rawChildren = (props as any).children;
    const extractText = (node: any): string => {
      if (node == null) return '';
      if (typeof node === 'string' || typeof node === 'number')
        return String(node);
      if (Array.isArray(node))
        return node.map(extractText).filter(Boolean).join(' ');
      if (typeof node === 'object' && node.props && node.props.children)
        return extractText(node.props.children);
      return '';
    };
    const label = extractText(rawChildren) || 'Delete';

    return (
      <AlertDialogPrimitive.Action ref={ref} asChild>
        <button
          {...(props as any)}
          className={cn(
            'ml-2 flex h-10 items-center justify-center bg-transparent p-0 text-destructive hover:underline'
          )}
        >
          {label}
        </button>
      </AlertDialogPrimitive.Action>
    );
  }

  return (
    <AlertDialogPrimitive.Action
      ref={ref}
      className={cn(desktopClasses, className)}
      {...props}
    />
  );
});
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const mobileClasses = cn(buttonVariants(), 'h-10 flex-1');
  const desktopClasses = cn(
    buttonVariants({ variant: 'outline' }),
    'mt-2 sm:mt-0'
  );

  return (
    <AlertDialogPrimitive.Cancel
      ref={ref}
      className={cn(isMobile ? mobileClasses : desktopClasses, className)}
      {...props}
    />
  );
});
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
