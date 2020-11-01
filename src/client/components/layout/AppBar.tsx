import { Button } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import IconButton from "@material-ui/core/IconButton";
import InputBase from "@material-ui/core/InputBase";
import {
  Theme,
  createStyles,
  fade,
  makeStyles,
} from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from "@material-ui/icons/Search";
import React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { withRouter } from "react-router-dom";

import { setSideBarOpen } from "../../actions";
import { IAppState, SideBarOpen } from "../../model";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    AppBarOverrides: {
      position: "fixed",
      backgroundColor: "#713033",
      margin: theme.spacing(0, 0, 0, 0),
    },
    grow: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
      [theme.breakpoints.up("md")]: {
        display: "none",
      },
    },
    title: {
      fontFamily: "LCHandwriting",
      fontSize: "2.25rem",
      display: "none",
      cursor: "pointer",
      [theme.breakpoints.up("sm")]: {
        display: "block",
      },
    },
    search: {
      position: "relative",
      borderRadius: theme.shape.borderRadius,
      backgroundColor: fade(theme.palette.common.white, 0.15),
      "&:hover": {
        backgroundColor: fade(theme.palette.common.white, 0.25),
      },
      marginRight: theme.spacing(2),
      marginLeft: 0,
      width: "100%",
      [theme.breakpoints.up("sm")]: {
        marginLeft: theme.spacing(3),
        width: "auto",
      },
    },
    searchIcon: {
      padding: theme.spacing(0, 2),
      height: "100%",
      position: "absolute",
      pointerEvents: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    inputRoot: {
      color: "inherit",
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
      transition: theme.transitions.create("width"),
      width: "100%",
      [theme.breakpoints.up("md")]: {
        width: "20ch",
      },
    },
    sectionRight: {
      display: "flex",
    },
    loginButton: {
      color: "inherit",
      backgroundColor: fade(theme.palette.common.black, 0.15),
    },
  })
);

interface IProps extends RouteComponentProps {
  sideBarOpen: boolean;
  setSideBarOpen: typeof setSideBarOpen;
  username: string;
}

const TopAppBar = withRouter((props: IProps) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [
    mobileMoreAnchorEl,
    setMobileMoreAnchorEl,
  ] = React.useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleSearchOnKeyDown = (
    evt: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (evt.key === "Enter" && evt.currentTarget.value !== "") {
      props.history.push(`/search/${evt.currentTarget.value}`);
    }
  };

  const goHome = () => {
    props.history.push("/");
  };

  const logIn = () => {
    props.history.push("/login");
  };

  const toggleNavPane = () => {
    props.setSideBarOpen(SideBarOpen.left);
  };

  return (
    <div className={classes.grow}>
      <AppBar position="static" className={classes.AppBarOverrides}>
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="open drawer"
            onClick={toggleNavPane}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            className={classes.title}
            variant="h6"
            onClick={goHome}
            noWrap
          >
            Leonard Cohen Notes
          </Typography>
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder="Search…"
              onKeyDown={handleSearchOnKeyDown}
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ "aria-label": "search" }}
            />
          </div>
          <div className={classes.grow} />
          <div className={classes.sectionRight}>
            {props.username ? (
              <Typography>{props.username}</Typography>
            ) : (
              <Button className={classes.loginButton} onClick={logIn}>
                Log&nbsp;in
              </Button>
            )}
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
});

const mapStateToProps = (state: IAppState) => ({
  sideBarOpen: !!state.ui.sideBarOpen,
  username: state.user.username,
});

export default connect(mapStateToProps, { setSideBarOpen })(TopAppBar);
