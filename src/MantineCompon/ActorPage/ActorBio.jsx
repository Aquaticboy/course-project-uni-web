import React from 'react';
import { Title, Paper, Spoiler, Text } from '@mantine/core';

const ActorBio = ({ biography, name, isDark }) => {
    
    const glassStyle = {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(10px)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #e9ecef',
    };

    return (
        <>
            <Title order={3} mb="sm" c="var(--mantine-color-text)">Біографія</Title>
            <Paper p="lg" radius="md" shadow="sm" mb={40} style={glassStyle}>
                <Spoiler maxHeight={200} showLabel="Читати повністю" hideLabel="Згорнути" transitionDuration={300}>
                    <Text 
                        lh={1.7} 
                        size="md" // Зменшив з lg на md для кращого сприйняття
                        c="var(--mantine-color-text)" 
                        style={{ whiteSpace: 'pre-line', textAlign: 'justify' }}
                    >
                        {biography || `Біографія українською мовою наразі відсутня для ${name}.`}
                    </Text>
                </Spoiler>
            </Paper>
        </>
    );
};

export default ActorBio;