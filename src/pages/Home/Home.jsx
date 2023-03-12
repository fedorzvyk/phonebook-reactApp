import { CharactersList } from 'components/CharactersList/CharactersList';
// import { getCharacters } from 'api/api';
import { toast } from 'react-toastify';

import { useEffect, useMemo, useState } from 'react';
import debounce from 'lodash/debounce';
import { useSearchParams } from 'react-router-dom';
import { searchCharacter } from 'api/api';
import Filter from 'components/Filter/Filter';
import { Loading } from 'components/Loading/Loading';
import { NotFound } from 'components/NotFound/NotFound';
import { Hero } from 'components/Hero/Hero';

const STATUS = {
  idle: 'idle',
  loading: 'loading',
  success: 'success',
  error: 'error',
};

const Home = () => {
  const [characters, setCharacters] = useState([]);
  const [status, setStatus] = useState(STATUS.idle);

  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get('page') ?? 1;
  const searchQuery = searchParams.get('search') ?? '';

  const [search, setSearch] = useState(searchQuery);

  const fetchData = async params => {
    setStatus(STATUS.loading);
    try {
      // console.log(params);
      const data = await searchCharacter(params);

      const count = data.info.count;
      if (count && params.query !== '') {
        toast.info(`We found ${count} characters`);
      }

      data.results.sort((a, b) => {
        if (a.name > b.name) {
          return 1;
        }
        if (a.name < b.name) {
          return -1;
        }
        return 0;
      });
      setCharacters(data.results);
      setStatus(STATUS.success);
    } catch (error) {
      console.log(error.message);
      setCharacters(null);
      setStatus(STATUS.error);
      toast.error('Bad request. Try to find another character');
    }
  };

  const handleSearch = event => {
    setSearch(event.target.value);
    searchPosts(event.target.value);
  };

  const searchPosts = useMemo(() => {
    return debounce(search => {
      // const searchParam = search !== '' ? { search } : {};
      setSearchParams(search !== '' ? { page: 1, search } : {});
      // setSearchParams(search !== '' ? { search } : {});
    }, 500);
  }, [setSearchParams]);

  useEffect(() => {
    fetchData({ page, query: searchQuery });
  }, [page, searchQuery]);

  return (
    <>
      <Hero />
      <Filter onFilter={handleSearch} filter={search} />
      {(status === STATUS.loading || status === STATUS.idle) && <Loading />}

      {status === STATUS.error && <NotFound />}
      {characters && <CharactersList characters={characters} />}
    </>
  );
};

export default Home;