import { useState } from 'react';
import { useHistory, Link } from 'react-router-dom'; // Link імпортовано
import { IconSearch, IconLogout, IconUser, IconSettings, IconLogin, IconUsers, IconShieldLock } from '@tabler/icons-react';
import {
  Autocomplete,
  Burger,
  Group,
  Drawer,
  Stack,
  Image,
  ActionIcon,
  rem,
  Center,
  Menu,
  Avatar,
  Button,
  Text,
  Divider
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from './HeaderSearch.module.css';
import ColorSchemeToggle from './ColorSchemeToggle'; 
import lagoonLogo from '../../images/LagoonLogoWhite-removebg.png';

// Переконайся, що шлях правильний (Context з великої літери, якщо папка так називається)
import { useAuth } from '../../Context/AuthContext';

const links = [
  { link: '/', label: 'Головна' },
  { link: '/MovieSearch', label: 'Фільми' },
  { link: '/BookSearch', label: 'Книги' }
];

export function HeaderSearch() {
  const [opened, { open, close, toggle }] = useDisclosure(false);
  const [searchValue, setSearchValue] = useState('');
  const history = useHistory();

  const { user, logout } = useAuth();

  const handleSearch = (query) => {
    if (query && query.trim().length > 0) {
      history.push(`/MovieSearch?search=${encodeURIComponent(query)}`);
      close();
      setSearchValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(searchValue);
    }
  };

  // ВИПРАВЛЕНО: Використовуємо Link замість <a>, щоб сторінка не перезавантажувалась
  const items = links.map((link) => (
    <Link
      key={link.label}
      to={link.link}
      className={classes.link}
      onClick={() => close()}
    >
      {link.label}
    </Link>
  ));

  return (
    <>
      {/* ===== MOBILE DRAWER (Мобільне меню) ===== */}
      <Drawer
        opened={opened}
        onClose={close}
        size="75%"
        padding="md"
        hiddenFrom="sm"
        title={<span style={{ fontWeight: 'bold', color: 'white' }}>Меню</span>}
        styles={{
            content: { backgroundColor: '#121212', color: 'white' },
            header: { backgroundColor: '#121212', color: 'white' },
            close: { color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }
        }}
      >
        <Stack gap="md">
          {/* БЛОК ПРОФІЛЮ ДЛЯ МОБІЛЬНИХ */}
          {user ? (
            <Group mb="md" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 15 }}>
              <Avatar src={user.avatar} alt={user.username} color="orange" radius="xl">
                 {user.username?.[0]?.toUpperCase()}
              </Avatar>
              <div style={{ flex: 1 }}>
                <Text size="sm" fw={500} c="white">
                  {user.username}
                </Text>
                <Text c="dimmed" size="xs">
                  {user.email}
                </Text>
              </div>
            </Group>
          ) : (
            <Button 
                component={Link} 
                to="/auth" 
                variant="gradient" 
                gradient={{ from: 'orange', to: 'red' }} 
                fullWidth 
                mb="md"
                onClick={close}
                leftSection={<IconLogin size={18}/>}
            >
                Увійти / Реєстрація
            </Button>
          )}

          <Autocomplete
            radius="xl"
            size="md"
            placeholder="Знайти фільм..."
            leftSection={<IconSearch size={16} stroke={1.5} color="#888" />}
            data={[]}
            value={searchValue}
            onChange={setSearchValue}
            onKeyDown={handleKeyDown}
            styles={{
                input: { 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    color: 'white', 
                    border: '1px solid rgba(255,255,255,0.1)' 
                }
            }}
            rightSection={
              <ActionIcon variant="transparent" c="white" onClick={() => handleSearch(searchValue)}>
                <IconSearch size={16} />
              </ActionIcon>
            }
          />
          {items}

          {/* Кнопка виходу для мобільних */}
          {user && (
             <Button 
                variant="subtle" 
                color="red" 
                fullWidth 
                leftSection={<IconLogout size={18} />}
                onClick={() => { logout(); close(); }}
                mt="md"
             >
                Вийти з акаунту
             </Button>
          )}

          <Center mt="xl" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
             <ColorSchemeToggle />
          </Center>

        </Stack>
      </Drawer>

      {/* ===== HEADER (Десктоп) ===== */}
      <header className={classes.header}>
        <div className={classes.inner}>
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              size="sm"
              hiddenFrom="sm"
              color="white" 
            />
            
            {/* ВИПРАВЛЕНО: Логотип тепер використовує Link замість <a> */}
            {/* Це запобігає перезавантаженню сторінки та зникненню аватара */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                <Image 
                    src={lagoonLogo} 
                    h={35} 
                    w="auto" 
                    fit="contain"
                    alt="Lagoon Logo"
                    className={classes.logo}
                />
            </Link>
          </Group>

          <Group visibleFrom="sm">
            <Group gap={5} className={classes.links}>
              {items}
            </Group>

            {/* Пошук */}
            <Autocomplete
              className={classes.search}
              placeholder="Пошук..."
              radius="xl"
              leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} color="#aaa" />}
              data={[]}
              value={searchValue}
              onChange={setSearchValue}
              onKeyDown={handleKeyDown}
              visibleFrom="xs"
              styles={{
                input: {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    transition: 'all 0.3s ease',
                    '&:focus': {
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        width: '280px'
                    },
                    '&::placeholder': { color: 'rgba(255, 255, 255, 0.4)' }
                }
              }}
              rightSection={
                 searchValue.length > 0 && (
                  <ActionIcon variant="transparent" c="white" onClick={() => handleSearch(searchValue)}>
                    <IconSearch size={14} />
                  </ActionIcon>
                 )
              }
            />

            <ColorSchemeToggle />

            {/* 3. ЛОГІКА ПРОФІЛЮ (ДЕСКТОП) */}
            {user ? (
              <Menu shadow="md" width={200} position="bottom-end" withArrow>
                <Menu.Target>
                  <Button 
                    variant="subtle" 
                    color="gray" 
                    style={{ color: 'white' }}
                    leftSection={
                        <Avatar src={user.avatar} alt={user.username} radius="xl" size={26} color="orange">
                          {user.username?.[0]?.toUpperCase()}
                        </Avatar>
                    }
                  >
                    {user.username}
                  </Button>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Мій акаунт</Menu.Label>
                  
                  <Menu.Item 
                    leftSection={<IconUser style={{ width: rem(14), height: rem(14) }} />}
                    component={Link} 
                    to="/profile"
                  >
                    Профіль
                  </Menu.Item>

                  <Menu.Item 
                    leftSection={<IconUsers style={{ width: rem(14), height: rem(14) }} />}
                    component={Link} 
                    to="/friends"
                  >
                    Друзі
                  </Menu.Item>

                  <Menu.Item 
                    leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}
                    component={Link} 
                    to="/settings"
                  >
                    Налаштування
                  </Menu.Item>
                  
                  <Menu.Divider />
                  
                  <Menu.Item 
                    color="red" 
                    leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
                    onClick={logout}
                  >
                    Вийти
                  </Menu.Item>

                  {user.role === 'admin' && (
                    <Menu.Item 
                      leftSection={<IconShieldLock style={{ width: rem(14), height: rem(14) }} />}
                      color="red"
                      component={Link} 
                      to="/admin"
                    >
                      Адмін Панель
                    </Menu.Item>
                  )}
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Button 
                component={Link} 
                to="/auth" 
                variant="light" 
                color="orange"
                radius="xl"
                size="xs"
              >
                Увійти
              </Button>
            )}
            
          </Group>
        </div>
      </header>
    </>
  );
}