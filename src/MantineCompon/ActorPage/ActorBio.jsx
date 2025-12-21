import React from 'react';
import { Title, Paper, Spoiler, Text } from '@mantine/core';

const ActorBio = ({ biography, name }) => {
    return (
        <>
            <Title order={3} mb="sm">Біографія</Title>
            <Paper withBorder p="lg" radius="md" bg="white" shadow="sm" mb={40}>
                <Spoiler maxHeight={200} showLabel="Читати повністю" hideLabel="Згорнути" transitionDuration={300}>
                    <Text lh={1.7} size="lg" c={biography ? 'dark' : 'dimmed'} style={{ whiteSpace: 'pre-line', textAlign: 'justify' }}>
                        {biography || `Біографія українською мовою наразі відсутня для ${name}.`}
                    </Text>
                </Spoiler>
            </Paper>
        </>
    );
};

export default ActorBio;