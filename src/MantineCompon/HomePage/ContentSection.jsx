import React from 'react';
import { Box, Title, ThemeIcon, Text, useMantineColorScheme } from '@mantine/core';
import Demo from '../CarouselDemo/Demo';

const ContentSection = ({ 
    title, 
    data, 
    Icon, 
    iconColor, 
    gradientFrom, 
    gradientTo, 
    glowColor,
    glowPosition
}) => {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    if (!data || data.length === 0) return null;

    const getGlowStyles = () => {
        if (!isDark || !glowColor) return {};
        
        const baseStyle = {
            position: 'absolute', top: '-150px', width: '600px', height: '600px',
            zIndex: 0, pointerEvents: 'none', filter: 'blur(80px)', opacity: 0.25
        };

        const colorMap = {
            blue: 'rgba(50, 100, 255, 1)',
            teal: 'rgba(20, 184, 166, 1)',
            orange: 'rgba(255, 128, 0, 1)',
        };

        const positionStyle = glowPosition === 'left' ? { left: '-200px' } : { right: '-200px' };

        return {
            ...baseStyle, ...positionStyle,
            background: `radial-gradient(circle, ${colorMap[glowColor] || colorMap.blue} 0%, transparent 70%)`
        };
    };

    return (
        <Box style={{ position: 'relative', overflow: 'visible' }}>
            {glowColor && <div style={getGlowStyles()} />}

            <Title 
                order={2} mb="lg" 
                style={{ 
                    display: 'flex', alignItems: 'center', gap: '15px', // Трохи збільшив відступ
                    position: 'relative', zIndex: 1 
                }}
            >
                {/* Збільшив іконку до 42px, щоб відповідала великому тексту */}
                <ThemeIcon size={42} radius="xl" color={iconColor} variant="light">
                    <Icon size={26} stroke={2} />
                </ThemeIcon>
                
                <Text 
                    component="span"
                    fw={700}
                    variant="gradient" 
                    gradient={{ from: gradientFrom, to: gradientTo, deg: 90 }}
                    style={{
                        fontSize: '1.8rem', 
                        
                        // Градієнт
                        backgroundImage: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        color: 'transparent'
                    }}
                >
                    {title}
                </Text>
            </Title>
            
            <Box style={{ position: 'relative', zIndex: 1 }}>
                <Demo data={data}/>
            </Box>
        </Box>
    );
};

export default ContentSection;