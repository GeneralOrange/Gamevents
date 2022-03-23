import React, { useState } from 'react';
import { Row, Col } from 'reactstrap';
import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { Button } from '@mantine/core';

import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Highlight from '../components/Highlight';
import SummonerForm from '../components/SummonerForm';

function Profile() {
  const { user, isLoading } = useUser();
  const [state, setState] = useState({
    summoner: '',
    userData: user,
    lockinMessage: 'Lock in',
    buttonState: false
  });
  
  const { summoner, userData, lockinMessage, button } = state;
  const handle = (e, fn) => {
    e.preventDefault();
    fn();
  }

  const lockInSummoner = async () => {
    try {
      const response = await fetch('/api/updateUserSummoner', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(summoner)
      });
      const data = await response.json();
      setState(previous => ({ ...previous, userData: data, lockinMessage: 'Locked in', buttonState: 'disabled'}))
    } catch (error) {
      console.log(error)
    }

  }

  return (
    <>
      {isLoading && <Loading />}
      {user && (
        <>
          <Row className="align-items-center profile-header mb-5 text-center text-md-left" data-testid="profile">
            <Col md={2}>
              <img
                src={user.picture}
                alt="Profile"
                className="rounded-circle img-fluid profile-picture mb-3 mb-md-0"
                decode="async"
                data-testid="profile-picture"
              />
            </Col>
            <Col md>
              <h2 data-testid="profile-name">{user.name}</h2>
              <p className="lead text-muted" data-testid="profile-email">
                {user.email}
              </p>
            </Col>
          </Row>
          <Row data-testid="profile-json">
            <Highlight>{JSON.stringify(userData, null, 2)}</Highlight>
            <Highlight>{JSON.stringify(userData.user_metadata, null, 2)}</Highlight>
          </Row>
          <SummonerForm setState={setState}/>
          <br/>
          { summoner &&
            <>
              <Highlight>{JSON.stringify(summoner, null, 2)}</Highlight>
              <Button color="green" onClick={e => handle(e, lockInSummoner)}>{ lockinMessage }</Button>
            </>
          }
        </>
      )}
    </>
  );
}

export default withPageAuthRequired(Profile, {
  onRedirecting: () => <Loading />,
  onError: error => <ErrorMessage>{error.message}</ErrorMessage>
});
