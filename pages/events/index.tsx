/* eslint-disable jsx-a11y/label-has-associated-control */
import { NextPage, GetServerSideProps } from 'next';
import Router from 'next/router';

import Layout from '@/components/Layout';
import { IEvent } from '@/models/interface/IEvent';
import EventClientModel from '@/models/event.client.model';

interface Props {
  events: IEvent[];
}

const EventsPage: NextPage<Props> = ({ events }) => (
  <Layout>
    <div className="mx-auto max-w-xl px-6 py-12 bg-white border-0 shadow-lg sm:rounded-3xl">
      <h1 className="text-2xl font-bold mb-8">진행중인 이벤트</h1>
      <div className="relative z-0 w-full mb-5">
        <ul className="relative z-0 w-full mb-1">
          {events.map((item) => (
            <li key={item.id} className="p-2 border rounded-md mb-2">
              <button
                className="w-full text-left focus:outline-none"
                type="button"
                onClick={async () => {
                  const targerPage = `/events/${item.id}`;
                  Router.push(targerPage);
                }}
              >
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p>
                  {item.desc}
                  <br />
                  <span>@{item.ownerName}</span>
                </p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </Layout>
);

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  try {
    const events = await EventClientModel.findAllEvent({ host: process.env.DOMAIN_HOST });
    console.log('getServerSideProp', events.payload?.length);
    if (events.payload === undefined) {
      return {
        props: {
          events: [],
        },
      };
    }
    return {
      props: {
        events: events.payload,
      },
    };
  } catch (err) {
    return {
      props: {
        events: [],
      },
    };
  }
};

export default EventsPage;
