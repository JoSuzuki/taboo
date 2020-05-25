import React from "react";
import { ThemeProvider } from "styled-components";
import themes, { ThemesEnum } from "./services/theme/theme";
import Lobby from "./components/Lobby/Lobby";
import styled from 'styled-components';
import Button from "./components/Button/Button";


const ThemeButtonContainer = styled.div`
  position: absolute;
  right: 16px;
  top: 16px;
`;

const AppContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.background};
  color: ${props => props.theme.color};
`;

const App: React.FC = () => {
  const [theme, setTheme] = React.useState<ThemesEnum>(ThemesEnum.lightTheme);

  return (
    <ThemeProvider theme={themes[theme]}>
      <AppContainer>
      <ThemeButtonContainer>
        <Button onClick={() => setTheme(prevTheme => prevTheme === ThemesEnum.darkTheme ? ThemesEnum.lightTheme : ThemesEnum.darkTheme)}>Trocar de tema</Button>
      </ThemeButtonContainer>
      <Lobby></Lobby>
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;
