/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaLabelingProps, DOMProps, DOMRef, DOMRefValue, forwardRefType} from '@react-types/shared';
import {Button, ContextValue, DisclosureStateContext, Heading, Provider, Disclosure as RACDisclosure, DisclosurePanel as RACDisclosurePanel, DisclosurePanelProps as RACDisclosurePanelProps, DisclosureProps as RACDisclosureProps, useLocale, useSlottedContext} from 'react-aria-components';
import {CenterBaseline} from './CenterBaseline';
import {centerPadding, focusRing, getAllowedOverrides, StyleProps, UnsafeStyles} from './style-utils' with { type: 'macro' };
import Chevron from '../ui-icons/Chevron';
import {filterDOMProps} from '@react-aria/utils';
import React, {createContext, forwardRef, ReactElement, useContext} from 'react';
import {size as sizeValue, style} from '../style/spectrum-theme' with { type: 'macro' };
import {useDOMRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';


export interface DisclosureProps extends RACDisclosureProps, StyleProps, DOMProps {
  /**
   * The size of the disclosure.
   * @default "M"
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /**
   * The amount of space between the disclosures.
   * @default "regular"
   */
  density?: 'compact' | 'regular' | 'spacious',
  /** Whether the disclosure should be displayed with a quiet style. */
  isQuiet?: boolean,
  /** The contents of the disclosure, consisting of an DisclosureHeader and DisclosurePanel. */
  children: [ReactElement<DisclosureHeaderProps>, ReactElement<DisclosurePanelProps>]
}

export const DisclosureContext = createContext<ContextValue<Omit<DisclosureProps, 'children'>, DOMRefValue<HTMLDivElement>>>(null);

const disclosure = style({
  color: 'heading',
  borderTopWidth: {
    default: 1,
    isQuiet: 0
  },
  borderBottomWidth: {
    default: 0,
    ':last-child': {
      default: 1,
      isQuiet: 0
    }
  },
  borderStartWidth: 0,
  borderEndWidth: 0,
  borderStyle: 'solid',
  borderColor: 'gray-200',
  minWidth: sizeValue(200)
}, getAllowedOverrides());

function Disclosure(props: DisclosureProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, DisclosureContext);
  let {
    size = 'M',
    density = 'regular',
    isQuiet, isDisabled
  } = props;
  let domRef = useDOMRef(ref);
  let {
    UNSAFE_style,
    UNSAFE_className = '',
    ...otherProps
  } = props;
  const domProps = filterDOMProps(otherProps);

  return (
    <Provider
      values={[
        [DisclosureContext, {size, isQuiet, density, isDisabled}]
      ]}>
      <RACDisclosure
        {...domProps}
        isDisabled={isDisabled}
        ref={domRef}
        style={UNSAFE_style}
        className={(UNSAFE_className ?? '') + disclosure({isQuiet}, props.styles)}>
        {props.children}
      </RACDisclosure>
    </Provider>
  );
}

/**
 * A disclosure is a collapsible section of content. It is composed of a a header with a heading and trigger button, and a panel that contains the content.
 */
let _Disclosure = /*#__PURE__*/ (forwardRef as forwardRefType)(Disclosure);
export {_Disclosure as Disclosure};

export interface DisclosureHeaderProps extends UnsafeStyles, DOMProps {
  /** The heading level of the disclosure header.
   * 
   * @default 3
   */
  level?: number,
  children: React.ReactNode
}

const headingStyle = style({
  margin: 0
});

const buttonStyles = style({
  ...focusRing(),
  outlineOffset: -2,
  font: 'heading',
  color: {
    default: 'neutral',
    isDisabled: 'disabled'
  },
  fontWeight: 'bold',
  fontSize: {
    size: {
      S: 'heading-xs',
      M: 'heading-sm',
      L: 'heading',
      XL: 'heading-lg'
    }
  },
  lineHeight: 'ui',
  display: 'flex',
  alignItems: 'baseline',
  paddingX: '[calc(self(minHeight) * 3/8 - 1px)]',
  paddingY: centerPadding(),
  gap: '[calc(self(minHeight) * 3/8 - 1px)]',
  minHeight: {
    // compact is equivalent to 'control', but other densities have more padding.
    size: {
      S: {
        density: {
          compact: 24,
          regular: 32,
          spacious: 40
        }
      },
      M: {
        density: {
          compact: 32,
          regular: 40,
          spacious: 48
        }
      },
      L: {
        density: {
          compact: 40,
          regular: 48,
          spacious: 56
        }
      },
      XL: {
        density: {
          compact: 48,
          regular: 56,
          spacious: 64
        }
      }
    }
  },
  width: 'full',
  backgroundColor: {
    default: 'transparent',
    isFocusVisible: 'transparent-black-100',
    isHovered: 'transparent-black-100'
  },
  borderWidth: 0,
  borderRadius: {
    // Only rounded for keyboard focus and quiet hover.
    default: 'none',
    isFocusVisible: 'control',
    isQuiet: {
      isHovered: 'control',
      isFocusVisible: 'control'
    }
  },
  textAlign: 'start',
  disableTapHighlight: true
});

const chevronStyles = style({
  rotate: {
    isRTL: 180,
    isExpanded: 90
  },
  transitionDuration: '100ms',
  transitionProperty: 'rotate',
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  },
  flexShrink: 0
});

function DisclosureHeader(props: DisclosureHeaderProps, ref: DOMRef<HTMLDivElement>) {
  let {
    level = 3,
    UNSAFE_style,
    UNSAFE_className = '',
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  const domProps = filterDOMProps(otherProps);
  let {direction} = useLocale();
  let {isExpanded} = useContext(DisclosureStateContext)!;
  let {size, density, isQuiet} = useSlottedContext(DisclosureContext)!;
  let isRTL = direction === 'rtl';
  return (
    <Heading
      {...domProps}
      level={level}
      ref={domRef}
      style={UNSAFE_style}
      className={(UNSAFE_className ?? '') + headingStyle}>
      <Button className={({isHovered, isFocused, isFocusVisible, isDisabled}) => buttonStyles({size, isHovered, isFocused, isFocusVisible, density, isQuiet, isDisabled})} slot="trigger">
        <CenterBaseline>
          <Chevron size={size} className={chevronStyles({isExpanded, isRTL})} aria-hidden="true" />
        </CenterBaseline>
        {props.children}
      </Button>
    </Heading>
  );
}

/**
 * A header for a disclosure. Contains a heading and a trigger button to expand/collapse the panel.
 */
let _DisclosureHeader = /*#__PURE__*/ (forwardRef as forwardRefType)(DisclosureHeader);
export {_DisclosureHeader as DisclosureHeader};

export interface DisclosurePanelProps extends RACDisclosurePanelProps, UnsafeStyles, DOMProps, AriaLabelingProps {
  children: React.ReactNode
}

const panelStyles = style({
  font: 'body',
  paddingTop: {
    isExpanded: 8
  },
  paddingBottom: {
    isExpanded: 16
  },
  paddingX: {
    isExpanded: {
      size: {
        S: 8,
        M: sizeValue(9),
        L: 12,
        XL: sizeValue(15)
      }
    }
  }
});

function DisclosurePanel(props: DisclosurePanelProps, ref: DOMRef<HTMLDivElement>) {
  let {
    UNSAFE_style,
    UNSAFE_className = '',
    ...otherProps
  } = props;
  const domProps = filterDOMProps(otherProps);
  let {size} = useSlottedContext(DisclosureContext)!;
  let {isExpanded} = useContext(DisclosureStateContext)!;
  let panelRef = useDOMRef(ref);
  return (
    <RACDisclosurePanel
      {...domProps}
      ref={panelRef}
      style={UNSAFE_style}
      className={(UNSAFE_className ?? '') + panelStyles({size, isExpanded})}>
      {props.children}
    </RACDisclosurePanel>
  );
}

/**
 * A disclosure panel is a collapsible section of content that is hidden until the disclosure is expanded.
 */
let _DisclosurePanel = /*#__PURE__*/ (forwardRef as forwardRefType)(DisclosurePanel);
export {_DisclosurePanel as DisclosurePanel};

