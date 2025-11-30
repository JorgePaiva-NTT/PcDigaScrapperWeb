import React from 'react'
import { Tab, Tabs } from "grommet"
import TechScrapper from './TechScrapper'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';//'https://pcdigascrapper.herokuapp.com';

export function getApiUrl() {
    return API_URL;
}

export function MainScrapperComponent() {
    return <Tabs>
        <Tab title='Scrap Tech'>
            <TechScrapper></TechScrapper>
        </Tab>
    </Tabs>
}
export default MainScrapperComponent;
