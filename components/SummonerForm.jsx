import React from 'react';
import { TextInput, Checkbox, Button, Group, Box } from '@mantine/core';
import { useForm } from '@mantine/form';

export default function SummonerForm({ setState }) {
  const form = useForm({
    initialValues: {
        summonerName: '',
        termsOfService: false,
    },
    validate: {
        termsOfService: (value) => true ? null : 'Please accept our terms of service',
    }
  });

  const handleSubmit = async values => {

    const res = await fetch('/api/fetchSummoner', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(values)
    })
    const data = await res.json();
    setState(previous => ({...previous, summoner: data}));
  }
  
  return (
    <Box sx={{ maxWidth: 300 }} mx="auto">
      <form onSubmit={form.onSubmit(values => handleSubmit(values))}>
        <TextInput
          required
          label="Summoner Name"
          placeholder="Crazy Betty"
          {...form.getInputProps('summonerName')}
        />

        <Checkbox
          mt="md"
          label="I agree to sell my privacy"
          {...form.getInputProps('termsOfService', { type: 'checkbox' })}
        />

        <Group position="left" mt="md">
          <Button type="submit">Find summoner</Button>
        </Group>
      </form>
    </Box>
  );
}