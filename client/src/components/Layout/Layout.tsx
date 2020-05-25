import React from 'react';
import styled from "styled-components";

interface LayoutProps {
  mt?: string;
  mb?: string;
  ml?: string;
  mr?: string;
  display?: 'flex';
  alignItems?: 'center';
}

const Layout = styled.div<LayoutProps>`
  margin-top: ${props => props.mt};
  margin-bottom: ${props => props.mb};
  margin-left: ${props => props.ml};
  margin-right: ${props => props.mr};
  display: ${props => props.display};
  align-items: ${props => props.alignItems};
`;

export default Layout