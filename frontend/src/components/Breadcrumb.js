import React, { useRef } from 'react';

export default function Breadcrumb() {
    const breadcrumbs = useRef(window.location.pathname.split('/').filter(item => item !== ''));

    return (
        <div className='text-capitalize'>
            <a href='/'>Home</a>
            {breadcrumbs.current.map((breadcrumb, index) => {
                const href = index !== breadcrumbs.current.length - 1
                    ? `/${breadcrumbs.current.slice(0, index + 1).join('/')}`
                    : null;

                return (
                    <span key={index}>
                        <span> / </span><a href={href && href}>{breadcrumb}</a>
                    </span>
                )
            })}
        </div>
    )
}
