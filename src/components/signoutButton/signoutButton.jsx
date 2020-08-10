import React, { Component } from "react";
import {
  Typography,
  Button
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import { colors } from "../../theme";
import { withNamespaces } from 'react-i18next';

import config from '../../config'
import Store from "../../stores";
const store = Store.store
const emitter = Store.emitter

const styles = theme => ({
  signoutContainer: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    zIndex: 999
  },
  actionButton: {
    color: colors.white,
    borderColor: colors.white
  },
})

class SignoutButton extends Component {

  constructor(props) {
    super()

    this.state = {
      loading: false,
    }
  }

  render() {

    const { classes } = this.props
    const { loading } = this.state

    return (
      <div className={ classes.signoutContainer }>
        <Button
          className={ classes.actionButton }
          variant="outlined"
          color="primary"
          onClick={ this.signoutClicked }
          disabled={ loading }
          >
          <Typography>Connect</Typography>
        </Button>
      </div>
    );
  }

  signoutClicked = () => {
    //Do something
  }
}

export default withNamespaces()(withStyles(styles)(SignoutButton));
