import {createTheme, ThemeOptions} from "@mui/material/styles";

export const theme: ThemeOptions = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#2cdfff',
        },
        secondary: {
            main: '#2c81ff',
        },
        // error: {
        //     main: '#d81b60',
        // },
    },
    components: {
        MuiButtonBase: {
            defaultProps: {
                disableRipple: true,
            }
        },
        MuiAppBar: {
            defaultProps: {
                color: 'transparent',
            }
        },
        MuiButton: {
            defaultProps: {
                size: 'small',
            }
        },
        MuiButtonGroup: {
            defaultProps: {
                size: 'small',
            }
        },
        MuiCheckbox: {
            defaultProps: {
                size: 'small',
            }
        },
        MuiFab: {
            defaultProps: {
                size: 'small',
            }
        },
        MuiFormControl: {
            defaultProps: {
                margin: 'dense',
                size: 'small',
            }
        },
        MuiFormHelperText: {
            defaultProps: {
                margin: 'dense',
            }
        },
        MuiIconButton: {
            defaultProps: {
                size: 'small',
            }
        },
        MuiInputBase: {
            defaultProps: {
                margin: 'dense',
            }
        },
        MuiInputLabel: {
            defaultProps: {
                margin: 'dense',
            }
        },
        MuiRadio: {
            defaultProps: {
                size: 'small',
            }
        },
        MuiSwitch: {
            defaultProps: {
                size: 'small',
            }
        },
        MuiTextField: {
            defaultProps: {
                margin: 'dense',
                size: 'small',
            }
        },
        MuiList: {
            defaultProps: {
                dense: true,
            }
        },
        MuiMenuItem: {
            defaultProps: {
                dense: true,
            }
        },
        MuiTable: {
            defaultProps: {
                size: 'small',
            }
        },
    },
});