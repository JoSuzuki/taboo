import styled from "styled-components";

const Button = styled.button`
  border-radius: 8px;
  background-color: ${props => props.theme.highBackground};
  box-shadow: ${props => props.theme.highBoxShadow};
  padding: 8px 16px;
  border: 0;
  color: ${props => props.theme.color};
  font-size: 20px;
`;

export default Button;
