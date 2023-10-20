import React, { useState } from 'react';
import { CSidebar, CSidebarBrand, CSidebarNav, CSidebarToggler } from '@coreui/react';

export default function AppSidebar(props) {
    const { sidebarShow, setSidebarShow, unfoldable, setUnfoldable } = props;

    function handleClick() {
        console.log('Clicked');
        setUnfoldable(!unfoldable);
    }

    return (
        <CSidebar
            position="fixed"
            visible={sidebarShow}
            unfoldable={unfoldable}
            onVisibleChange={(visible) => {
                console.log('visibleChange: ', visible);
            }}
        >
            <CSidebarBrand className="d-none d-md-flex" to="/">
                <img className='LOGO' src='/assets/images/logo.png'></img>
            </CSidebarBrand>
            <CSidebarNav>
                {['Option 1', 'Option 2', 'Option 3'].map((option, index) => {
                    return (
                        <div key={index}>
                            {option}
                        </div>
                    )
                })}
            </CSidebarNav>
            <CSidebarToggler
                className="d-none d-lg-flex"
                onClick={e => handleClick()}
            />
        </CSidebar>
    )
}
