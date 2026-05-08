import React, { useEffect, useRef, useState } from 'react';
import { Popover as MuiPopover, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import type { ReactNode } from 'react';

interface PopoverProps {
  className?: string;
  trigger: ReactNode;
  refExit?: () => void;
  hide?: boolean;
  content: ReactNode;
  classes?: Record<string, string>;
  [key: string]: unknown;
}

const Popover = ({ className, trigger, refExit, hide, content, ...providedProps }: PopoverProps) => {
  const [isOpen, open] = useState(false);
  const anchorEl = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      const shouldHide = typeof hide === 'boolean' ? hide : false;
      if (shouldHide) {
        open(false);
      }
    }
  }, [hide, isOpen, open]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    anchorEl.current = event.currentTarget;
    open(true);
  };

  const handleRequestClose = () => {
    open(false);
  };

  const classes = (providedProps.classes || {}) as Record<string, string>;
  const closeIconClass = classes.closeIcon;
  const passedProps = { ...providedProps };
  if (passedProps.classes && typeof passedProps.classes === 'object') {
    const { closeIcon, ...restClasses } = passedProps.classes as Record<string, string>;
    passedProps.classes = restClasses;
  }

  const transformOriginSpecs = {
    vertical: 'top' as const,
    horizontal: 'center' as const,
  };

  const anchorOriginSpecs = {
    vertical: 'bottom' as const,
    horizontal: 'center' as const,
  };

  const handleOnExit = () => {
    if (refExit) {
      refExit();
    }
  };

  const triggerProps = {
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      if (React.isValidElement(trigger)) {
        (trigger.props as { onClick?: (event: React.MouseEvent<HTMLElement>) => void }).onClick?.(event);
      }
      handleClick(event);
    },
  };

  return (
    <>
      <span key="content" {...triggerProps}>
        {trigger}
      </span>
      <MuiPopover
        elevation={2}
        open={isOpen}
        slotProps={{
          transition: {
            onExited: handleOnExit,
          },
        }}
        onClose={handleRequestClose}
        anchorEl={anchorEl.current}
        anchorOrigin={anchorOriginSpecs}
        transformOrigin={transformOriginSpecs}
        {...passedProps}>
        <IconButton
          aria-label="Close"
          onClick={handleRequestClose}
          className={closeIconClass}
          style={{ position: 'absolute', right: '4px', top: '4px', zIndex: 1000 }}>
          <CloseIcon />
        </IconButton>
        {content}
      </MuiPopover>
    </>
  );
};

export default Popover;
