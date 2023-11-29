import { Fragment, useEffect, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { useNavigate } from 'react-router-dom';

export default function BookingForm({ host, isAdmin }) {
  const navigate = useNavigate();

  const [id, setId] = useState("");
  const [topic, setTopic] = useState("Web App Development");
  const [date, setDate] = useState("");
  const [showTimeslot, setShowTimeslot] = useState(false);
  const [timeslot, setTimeslot] = useState(timeslots[0]);
  const [remark, setRemark] = useState("");
  const [bookings, setBookings] = useState([]); // [{date: '2021-10-01', timeslot: 10}, {date: '2021-10-01', timeslot: 11}

  const handleRemarkChanged = (e) => {
    setRemark(e.target.value);
  }

  const handleBooked = async () => {
    // check if the timeslot is taken
    if (bookings.find(booking => booking.date === date && booking.timeslot === timeslot.value)) {
      alert("This timeslot is taken!");
      return;
    }

    if (topic === "" || timeslot === "" || remark === "" || date === "") {
      alert("Please fill in all the fields!");
      return;
    }

    console.log(topic, date, timeslot, remark);

    try {
      const res = await fetch(`${host}/api/booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, date, timeslot, remark }),
      });
      const data = await res.json();
      console.log(data);

      if (data.success) {
        alert("Booked successfully!");
        // window.location.href = "/";

      }

    } catch (err) {
      console.log(err);
    }
  }

  const handleUpdate = async () => {

    if (topic === "" || timeslot === "" || remark === "" || date === "") {
      alert("Please fill in all the fields!");
      return;
    }

    console.log(topic, date, timeslot, remark);

    try {
      const res = await fetch(`${host}/api/booking`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, topic, date, timeslot, remark }),
      });
      const data = await res.json();
      console.log(data);

      if (data.success) {
        alert("Updated successfully!");
        // navigate to home page
        navigate("/");
      }

    } catch (err) {
      alert("Updated failed!");
    }
  }

  const handleDelete = async () => {
    // delete a booking
    try {
      const res = await fetch(`${host}/api/booking`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      console.log(data);

      if (data.success) {
        alert("Deleted successfully!");
        // navigate to home page
        navigate("/");
      }

    } catch (err) {
      console.log(err);
    }
  }

  const handleDateChanged = async (e) => {
    // get all events of the chosen date from the database. if the timeslot is taken, set the timeslot online as false and make it unclickable

    setDate(e.target.value);
    setShowTimeslot(false);

    var newBookings = await fetch(`${host}/api/booking_for_one_date?date=${e.target.value}`).then(res => res.json());

    setBookings(newBookings);

    timeslots.forEach(timeslot => timeslot.online = true);

    for (var i = 0; i < newBookings.length; i++) {
      var booking = newBookings[i];
      var timeslot = timeslots.find(timeslot => timeslot.value === booking.timeslot);
      timeslot.online = false;
    }

    console.log(timeslots);
    setShowTimeslot(true);
  }

  // if isAdmin & query string has id, fetch the booking and fill in the form
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('id');

    if (isAdmin && bookingId) {
      // fetch the booking
      fetch(`${host}/api/booking/${bookingId}`)
        .then(res => res.json())
        .then(booking => {

          console.log(booking,222)
          setId(bookingId);
          setTopic(booking.topic);
          setDate(booking.date);
          setTimeslot(timeslots.find(timeslot => timeslot.value === booking.timeslot));
          // set timeslot online to false
          timeslots.find(timeslot => timeslot.value === booking.timeslot).online = false;
          setShowTimeslot(true);
          setRemark(booking.remark);
        })
    }
  }, []);

  return (
    <div id="booking-form" className="mx-auto max-w-7xl px-4 mb-8 sm:px-6 lg:px-8 text-left">
      <div className="mx-auto max-w-3xl">
        <form>
        <div className="space-y-12">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
            <div>
              <h2 className="text-base font-semibold leading-7 text-gray-900">Booking Form</h2>

              <p className="mt-1 text-sm leading-6 text-gray-600">Fill in the information and book a section with our team!</p>
            </div>

            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
              <div className="sm:col-span-3">
                <label htmlFor="country" className="block text-sm font-medium leading-6 text-gray-900">
                  Topic
                </label>
                <div className="mt-2">
                  <select
                    id="topic"
                    name="topic"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:max-w-xs sm:text-sm sm:leading-6"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  >
                    <option>Web App Development</option>
                    <option>Mobile App Development</option>
                    <option>CD/CI</option>
                    <option>Machine Learning</option>
                    <option>Web Scraping</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                  Date
                </label>
                <div className="mt-2">
                  <input
                    type="date"
                    name="date"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    onChange={handleDateChanged}
                    value={date}
                  />
                </div>
              </div>

              {showTimeslot && (
                <div className="sm:col-span-3">
                <Timeslots timeslot={timeslot} setTimeslot={setTimeslot} />
                </div>
              )}

              <div className="col-span-full">
                <label htmlFor="about" className="block text-sm font-medium leading-6 text-gray-900">
                  Remark
                </label>
                <div className="mt-2">
                  <textarea
                    id="about"
                    name="about"
                    rows={3}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                    value={remark}
                    onChange={handleRemarkChanged}
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-gray-600">Write a few sentences about yourself and what you would like to learn about programming.</p>
              </div>

            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          {isAdmin && (
            <>
            <div
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              onClick={handleDelete}
            >
              Delete
            </div>
            <div
              className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              onClick={handleUpdate}
            >
              Update
            </div>
            </>
          )}

          {!isAdmin && (
            <div
              className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              onClick={handleBooked}
            >
              Book Now
            </div>
          )}
        </div>
      </form>

      </div>
    </div>


  )
}

const timeslots = [
  { id: 1, name: '10AM', online: true, value: 10 },
  { id: 2, name: '11AM', online: true, value: 11 },
  { id: 3, name: '12PM', online: true, value: 12 },
  { id: 4, name: '1PM', online: true, value: 13 },
  { id: 5, name: '2PM', online: true, value: 14 },
  { id: 6, name: '3PM', online: true, value: 15 },
  { id: 7, name: '4PM', online: true, value: 16 },
  { id: 8, name: '5PM', online: true, value: 17 },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function Timeslots({ timeslot, setTimeslot }) {
  return (
    <Listbox value={timeslot} onChange={setTimeslot}>
      {({ open }) => (
        <>
          <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">Time slots</Listbox.Label>
          <div className="relative mt-2">
            <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
              <span className="flex items-center">
                <span
                  aria-label={timeslot.online ? 'Online' : 'Offline'}
                  className={classNames(
                    timeslot.online ? 'bg-green-400' : 'bg-gray-200',
                    'inline-block h-2 w-2 flex-shrink-0 rounded-full'
                  )}
                />
                <span className="ml-3 block truncate">{timeslot.name}</span>
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {timeslots.map((singleTimeslot) => (
                  <Listbox.Option
                    key={singleTimeslot.id}
                    className={({ active }) =>
                      classNames(
                        active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                        'relative cursor-default select-none py-2 pl-3 pr-9'
                      )
                    }
                    value={singleTimeslot}
                  >
                    {({ timeslot, active }) => (
                      <>
                        <div className="flex items-center">
                          <span
                            className={classNames(
                              singleTimeslot.online ? 'bg-green-400' : 'bg-gray-200',
                              'inline-block h-2 w-2 flex-shrink-0 rounded-full'
                            )}
                            aria-hidden="true"
                          />
                          <span
                            className={classNames(timeslot ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                          >
                            {singleTimeslot.name}
                            <span className="sr-only"> is {singleTimeslot.online ? 'online' : 'offline'}</span>
                          </span>
                        </div>

                        {timeslot ? (
                          <span
                            className={classNames(
                              active ? 'text-white' : 'text-indigo-600',
                              'absolute inset-y-0 right-0 flex items-center pr-4'
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  )
}