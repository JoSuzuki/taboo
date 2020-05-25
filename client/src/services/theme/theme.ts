interface ITheme {
  background: string;
  highBackground: string;
  highBoxShadow: string;
  lowBackground: string;
  lowBoxShadow: string;
  color: string;
}

const lightTheme: ITheme = {
  background: '#ECF0F3',
  highBackground: '#e3e6ec',
  highBoxShadow: '-4px -4px 7px #f2f5f7, 4px 4px 7px #D1D9E6',
  lowBackground: '#e6e9ef',
  lowBoxShadow: 'inset -4px -4px 3px #f2f5f7, inset 4px 4px 3px #D1D9E6',
  color: '#292D32',
}

const darkTheme: ITheme = {
  background: '#292D32',
  highBackground: '#2a2d32',
  highBoxShadow: '-4px -4px 7px #30343A, 4px 4px 7px #24262B',
  lowBackground: '#2a2d32',
  lowBoxShadow: 'inset -4px -4px 7px #30343A, inset 4px 4px 7px #24262B',
  color: '#ECF0F3'
}

export enum ThemesEnum {
  lightTheme = 'lightTheme',
  darkTheme = 'darkTheme'
}

const themes: {[TNAME in ThemesEnum]: ITheme } = {
  lightTheme,
  darkTheme
}

export default themes;