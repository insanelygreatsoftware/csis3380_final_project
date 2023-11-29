import { Fragment, useEffect, useRef, useState } from 'react'
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, EllipsisHorizontalIcon } from '@heroicons/react/20/solid'
import { Menu, Transition } from '@headlessui/react'
import { Link, useNavigate } from 'react-router-dom'
import moment from 'moment-timezone';


function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Calendar({ host, isAdmin }) {
  const navigate = useNavigate();

  const container = useRef(null)
  const containerNav = useRef(null)
  const containerOffset = useRef(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [week, setWeek] = useState(getWeekNumber(new Date())); // [year, week
  const [events, setEvents] = useState([]);
  const [daysOfWeek, setDaysOfWeek] = useState([]);

  // check if is mobile device
  const isMobile = window.innerWidth < 768;

  // track first mount
  const isFirstMount = useRef(true);

  // page load
  useEffect(() => {
    // Get the year and week number for current date
    var year = new Date().getFullYear();
    var week = getWeekNumber(new Date());

    setDaysOfWeek(getDaysOfWeek(year, week));
  }, []);

  // ask /api/booking for all events
  useEffect(() => {
    console.log(year, week, month, daysOfWeek);

    if (isMobile) {
      if (isFirstMount.current) {
        var date = new Date().toISOString().slice(0, 10);
        console.log(date)
        isFirstMount.current = false;
      } else if (daysOfWeek.length > 0) {
        // get the first date from daysOfWeek
        var date = `${daysOfWeek[0].year}-${daysOfWeek[0].month + 1}-${daysOfWeek[0].day}`;
      }

      getEventsForOneDate(date);
    } else {
      getEvents(year, week);
    }
  }, [week, year, daysOfWeek]);

  function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    // Return array of year and week number
    // return [d.getUTCFullYear(), weekNo];
    return weekNo;
  }

  function getDaysOfWeek(year, weekNumber) {
    // Calculate the date of the first day of the week
    let januaryFirst = new Date(year, 0, 1);
    let daysToFirst = (1 - januaryFirst.getUTCDay() + 7) % 7;
    let startOfWeek = new Date(Date.UTC(year, 0, daysToFirst + (weekNumber - 1) * 7 + 2));

    // Create an array for the week
    let week = Array.from({ length: 7 }, (_, i) => {
      let day = new Date(Date.UTC(startOfWeek.getUTCFullYear(), startOfWeek.getUTCMonth(), startOfWeek.getUTCDate() + i));
      return {
        date: day,
        year: day.getFullYear(),
        month: day.getMonth(),
        day: day.getDate() // Use getDate() instead of getUTCDate()
      };
    });

    console.log(week);

    return week;
  }

  const handleNextWeekClick = () => {
    // empty events
    setEvents([]);

    if (week === 52) {
      var newYear = year + 1;
      var newWeek = 1;
      var newDaysOfWeek = getDaysOfWeek(newYear, newWeek);

      setYear(newYear);

      // set month with new Date()
      var date = new Date(newYear, 0, 1);
      date.setDate(newWeek * 7);
      setMonth(date.toLocaleString('default', { month: 'long' }));

      setWeek(newWeek);
      setDaysOfWeek(newDaysOfWeek);
      return;
    }
    // calculate month after incrementing week
    var newYear = new Date().getFullYear();
    var newWeek = week + 1;

    var date = new Date(year, 0, 1);
    date.setDate(week * 7);
    setMonth(date.toLocaleString('default', { month: 'long' }));
    setWeek(newWeek);

    var newDaysOfWeek = getDaysOfWeek(newYear, newWeek);
    setDaysOfWeek(newDaysOfWeek);

    return;
  };

  const handlePreviousWeekClick = () => {
    // empty events
    setEvents([]);

    if (week === 1) {
      var newYear = year - 1;
      var newWeek = 52;
      var newDaysOfWeek = getDaysOfWeek(newYear, newWeek);

      setYear(newYear);
      setWeek(newWeek);

      // set month with new Date()
      var date = new Date(year - 1, 11, 31); // Last day of the previous year
      setMonth(date.toLocaleString('default', { month: 'long' }));
      setWeek(newWeek);
      setDaysOfWeek(newDaysOfWeek);

    } else {
      var newYear = year;
      var newWeek = week - 1;
      var newDaysOfWeek = getDaysOfWeek(newYear, newWeek);

      setYear(newYear);
      setWeek(newWeek);

      // calculate month after decrementing week
      var date = new Date(year, 0, 1);
      date.setDate((week - 1) * 7);
      setMonth(date.toLocaleString('default', { month: 'long' }));

      setDaysOfWeek(newDaysOfWeek);
    }
  };

  const handleTodayClick = () => {
    // if today is already selected, do nothing
    if (year === new Date().getFullYear() && week === getWeekNumber(new Date())) {
      console.log('do nothing')
      return;
    }

    // empty events
    setEvents([]);

    var newYear = new Date().getFullYear();
    var newWeek = getWeekNumber(new Date());

    setYear(newYear);
    setMonth(new Date().toLocaleString('default', { month: 'long' }));
    setWeek(newWeek);

    var newDaysOfWeek = getDaysOfWeek(newYear, newWeek);
    setDaysOfWeek(newDaysOfWeek);

    console.log(newYear, newWeek, newDaysOfWeek);
  };

  async function getEventsForOneDate(date) {
    if (!isMobile) return;

    console.log(date)

    await fetch(`${host}/api/booking_for_one_date?date=${date}`).then((response) => {
      return response.json();
    }).then((data) => {
      console.log(data);
      setEvents(data);
    });
  }

  async function getEvents(year, week) {
    await fetch(`${host}/api/booking?year=${year}&week=${week}`).then((response) => {
      return response.json();
    }).then((data) => {
      console.log(data);
      setEvents(data);
    });
  }

  const handleBookingClicked = (e) => {
    console.log('Event:', e);
    console.log('ID:', e.currentTarget.dataset.id);

    if (!isAdmin) {
      console.log(isAdmin);
      return;
    }

    var id = e.currentTarget.dataset.id;
    console.log(id);

    // redirect to booking page with id in react router
    navigate(`/booking?id=${id}`);
  };

  return (
    <div id="calendar" className="flex h-full flex-col max-w-full sm:max-w-[80%] mx-auto sm:max-h-[70rem]">
      <header className="flex flex-none items-center justify-between border-b border-gray-200 px-6 py-4">
        <h1 className="text-base font-semibold leading-6 text-gray-900">
          <time>{month} {year}</time>
        </h1>
        <div className="flex items-center">
          <div className="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
            <button
              type="button"
              className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50"
              onClick={handlePreviousWeekClick}
            >
              <span className="sr-only">Previous week</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="hidden border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block"
              onClick={handleTodayClick}
            >
              Today
            </button>
            <span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
            <button
              type="button"
              className="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50"
              onClick={handleNextWeekClick}
            >
              <span className="sr-only">Next week</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="hidden md:ml-4 md:flex md:items-center">
            {/* <Menu as="div" className="relative">
              <Menu.Button
                type="button"
                className="flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Week view
                <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-3 w-36 origin-top-right overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'block px-4 py-2 text-sm'
                          )}
                        >
                          Day view
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'block px-4 py-2 text-sm'
                          )}
                        >
                          Week view
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'block px-4 py-2 text-sm'
                          )}
                        >
                          Month view
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'block px-4 py-2 text-sm'
                          )}
                        >
                          Year view
                        </a>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu> */}
            <div className="ml-6 h-6 w-px bg-gray-300" />
            <Link
              to={{
                pathname: '/booking',
                hash: '#booking-form',
              }}
              className="ml-6 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
              Book an Appointment
            </Link>
          </div>
          {/* <Menu as="div" className="relative ml-6 md:hidden">
            <Menu.Button className="-mx-2 flex items-center rounded-full border border-transparent p-2 text-gray-400 hover:text-gray-500">
              <span className="sr-only">Open menu</span>
              <EllipsisHorizontalIcon className="h-5 w-5" aria-hidden="true" />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-3 w-36 origin-top-right divide-y divide-gray-100 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                          'block px-4 py-2 text-sm'
                        )}
                      >
                        Create event
                      </a>
                    )}
                  </Menu.Item>
                </div>
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                          'block px-4 py-2 text-sm'
                        )}
                      >
                        Go to today
                      </a>
                    )}
                  </Menu.Item>
                </div>
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                          'block px-4 py-2 text-sm'
                        )}
                      >
                        Day view
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                          'block px-4 py-2 text-sm'
                        )}
                      >
                        Week view
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                          'block px-4 py-2 text-sm'
                        )}
                      >
                        Month view
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                          'block px-4 py-2 text-sm'
                        )}
                      >
                        Year view
                      </a>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu> */}
        </div>
      </header>

      <div ref={container} className="isolate flex flex-auto flex-col overflow-auto bg-white">
        <div style={{ width: '165%' }} className="flex max-w-full flex-none flex-col sm:max-w-none md:max-w-full">
          <div
            ref={containerNav}
            className="sticky top-0 z-30 flex-none bg-white shadow ring-1 ring-black ring-opacity-5 sm:pr-8"
          >
            {/* mobile menu */}
            <div className="grid grid-cols-7 text-sm leading-6 text-gray-500 sm:hidden">
              <button type="button" className="flex flex-col items-center pb-3 pt-2" onClick={() => getEventsForOneDate(`${daysOfWeek[0].year}-${daysOfWeek[0].month + 1}-${daysOfWeek[0].day}`)}>
                M <span className="mt-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900">{daysOfWeek[0] && daysOfWeek[0].day}</span>
              </button>
              <button type="button" className="flex flex-col items-center pb-3 pt-2" onClick={() => getEventsForOneDate(`${daysOfWeek[1].year}-${daysOfWeek[1].month + 1}-${daysOfWeek[1].day}`)}>
                T <span className={`mt-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900`}>{daysOfWeek[1] && daysOfWeek[1].day}</span>
              </button>
              <button type="button" className="flex flex-col items-center pb-3 pt-2" onClick={() => getEventsForOneDate(`${daysOfWeek[2].year}-${daysOfWeek[2].month + 1}-${daysOfWeek[2].day}`)}>
                W
                <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full font-semibold text-gray-900">
                {daysOfWeek[2] && daysOfWeek[2].day}
                </span>
              </button>
              <button type="button" className="flex flex-col items-center pb-3 pt-2" onClick={() => getEventsForOneDate(`${daysOfWeek[3].year}-${daysOfWeek[3].month + 1}-${daysOfWeek[3].day}`)}>
                T <span className="mt-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900">{daysOfWeek[3] && daysOfWeek[3].day}</span>
              </button>
              <button type="button" className="flex flex-col items-center pb-3 pt-2" onClick={() => getEventsForOneDate(`${daysOfWeek[4].year}-${daysOfWeek[4].month + 1}-${daysOfWeek[4].day}`)}>
                F <span className="mt-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900">{daysOfWeek[4] && daysOfWeek[4].day}</span>
              </button>
              <button type="button" className="flex flex-col items-center pb-3 pt-2" onClick={() => getEventsForOneDate(`${daysOfWeek[5].year}-${daysOfWeek[5].month + 1}-${daysOfWeek[5].day}`)}>
                S <span className="mt-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900">{daysOfWeek[5] && daysOfWeek[5].day}</span>
              </button>
              <button type="button" className="flex flex-col items-center pb-3 pt-2" onClick={() => getEventsForOneDate(`${daysOfWeek[6].year}-${daysOfWeek[6].month + 1}-${daysOfWeek[6].day}`)}>
                S <span className="mt-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900">{daysOfWeek[6] && daysOfWeek[6].day}</span>
              </button>
            </div>

            {/* desktop menu */}
            <div className="-mr-px hidden grid-cols-7 divide-x divide-gray-100 border-r border-gray-100 text-sm leading-6 text-gray-500 sm:grid">
              <div className="col-end-1 w-14" />

              <div className="flex items-center justify-center py-3">
                <span>
                  Mon <span className="items-center justify-center font-semibold text-gray-900">{daysOfWeek[0] && daysOfWeek[0].day}</span>
                </span>
              </div>
              <div className="flex items-center justify-center py-3">
                <span>
                  Tue <span className={`items-center justify-center font-semibold text-gray-900`}>{daysOfWeek[1] && daysOfWeek[1].day}</span>
                </span>
              </div>
              <div className="flex items-center justify-center py-3">
                <span className="">
                  Wed <span className="items-center justify-center font-semibold text-gray-900">{daysOfWeek[2] && daysOfWeek[2].day}</span>
                </span>
              </div>
              <div className="flex items-center justify-center py-3">
                <span>
                  Thu <span className="items-center justify-center font-semibold text-gray-900">{daysOfWeek[3] && daysOfWeek[3].day}</span>
                </span>
              </div>
              <div className="flex items-center justify-center py-3">
                <span>
                  Fri <span className="items-center justify-center font-semibold text-gray-900">{daysOfWeek[4] && daysOfWeek[4].day}</span>
                </span>
              </div>
              <div className="flex items-center justify-center py-3">
                <span>
                  Sat <span className="items-center justify-center font-semibold text-gray-900">{daysOfWeek[5] && daysOfWeek[5].day}</span>
                </span>
              </div>
              <div className="flex items-center justify-center py-3">
                <span>
                  Sun <span className="items-center justify-center font-semibold text-gray-900">{daysOfWeek[6] && daysOfWeek[6].day}</span>
                </span>
              </div>


            </div>
          </div>


          <div className="flex flex-auto">
            <div className="sticky left-0 z-10 w-14 flex-none bg-white ring-1 ring-gray-100" />
            <div className="grid flex-auto grid-cols-1 grid-rows-1">

              {/* Horizontal lines */}
              <div ref={containerOffset} className="row-end-1 h-7"></div>
              <div
                className="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100"
                style={{ gridTemplateRows: 'repeat(17, minmax(3.5rem, 1fr))' }}
              >

                <div />

                <div>
                  <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    10AM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    11AM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    12PM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    1PM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    2PM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    3PM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    4PM
                  </div>
                </div>
                <div />
                <div>
                  <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    5PM
                  </div>
                </div>
                <div />



              </div>

              {/* Vertical lines */}
              <div className="col-start-1 col-end-2 row-start-1 hidden grid-cols-7 grid-rows-1 divide-x divide-gray-100 sm:grid sm:grid-cols-7">
                <div className="col-start-1 row-span-full" />
                <div className="col-start-2 row-span-full" />
                <div className="col-start-3 row-span-full" />
                <div className="col-start-4 row-span-full" />
                <div className="col-start-5 row-span-full" />
                <div className="col-start-6 row-span-full" />
                <div className="col-start-7 row-span-full" />
                <div className="col-start-8 row-span-full w-8" />
              </div>

              {/* Events */}
              <ol
                className="col-start-1 col-end-2 row-start-1 grid grid-cols-1 sm:grid-cols-7 sm:pr-8"
                style={{ gridTemplateRows: 'repeat(17, minmax(0, 1fr)) auto', width: "auto"}}
              >

                {events.map((event, index) => {
                  // transform date into col-start
                  var date = moment.tz(event.date, "America/Vancouver");
                  var day = date.day();
                  var col;
                  switch (day) {
                    case 1:
                      col = 1;
                      break;
                    case 2:
                      col = 2;
                      break;
                    case 3:
                      col = 3;
                      break;
                    case 4:
                      col = 4;
                      break;
                    case 5:
                      col = 5;
                      break;
                    case 6:
                      col = 6;
                      break;
                    case 0:
                      col = 7;
                      break;
                  }

                  // set to 1 in mobile
                  if (isMobile) {
                    col = 1;
                  }

                  var AMPM = event.timeslot > 11 ? "PM" : "AM";
                  var row;
                  switch (event.timeslot) {
                    case 10:
                      row = 2;
                      break;
                    case 11:
                      row = 4;
                      break;
                    case 12:
                      row = 6;
                      break;
                    case 13:
                      row = 8;
                      break;
                    case 14:
                      row = 10;
                      break;
                    case 15:
                      row = 12;
                      break;
                    case 16:
                      row = 14;
                      break;
                    case 17:
                      row = 16;
                      break;
                    default:
                      row = 0;
                      break;
                  }



                  return (
                    <li key={index} className={`relative flex col-start-${col}`} style={{ gridRow: `${row} / span 2` }} data-id={event._id} onClick={handleBookingClicked}>
                      <a
                        className="group absolute inset-1 flex flex-col overflow-y-auto rounded-lg bg-blue-50 p-2 text-xs leading-5 hover:bg-blue-100"
                      >
                        <p className="order-1 font-semibold text-blue-700">{event.topic}</p>
                        <p className="text-blue-500 group-hover:text-blue-700">
                          <time dateTime="2022-01-12T06:00">{event.timeslot}:00 {AMPM}</time>
                        </p>
                      </a>
                    </li>
                  )
                })}

              </ol>


            </div>
          </div>


        </div>
      </div>
    </div>
  )
}
