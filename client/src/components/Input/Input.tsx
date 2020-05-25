import styled from 'styled-components';

const Input = styled.input`
  border-radius: 8px;
  background-color: ${props => props.theme.lowBackground};
  box-shadow: ${props => props.theme.lowBoxShadow};
  padding: 8px 16px;
  border: 0;
  color: ${props => props.theme.color};
  font-size: 20px;
`;

export default Input;