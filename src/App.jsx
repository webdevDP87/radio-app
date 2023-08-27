import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import ReactPlayer from 'react-player';

function App() {

	// globe options
	const [selectedPolygon, setSelectedPolygon] = useState(null);
	const [hoverD, setHoverD] = useState();

	// countries options
	const [countries, setCountries] = useState({ features: [] });
	const [showCountriesList, setShowCountriesList] = useState(false)
	const [requestCountry, setrequestCountry] = useState('');
	
	// player options
	const [radioStations, setRadioStations] = useState([])
	const [activeRadioStation, setActiveRadioStation] = useState(null);
	const [isPlaying, setIsPlaying] = useState(true);

	const toggleCountriesList = () => {
		setShowCountriesList((showCountriesList) => !showCountriesList)
	}

	const globeEl = useRef(null);

	const centerMap = (pos) => {
		globeEl.current.pointOfView(
			{
				...pos, altitude: 2.5,
			}, 500
		)
	}

	const defaultGlobePosition = {
		lat: 52.03,
		lng: 19.27,
	}

	const selectPolygon = (countryName) => {
		const foundPolygon = countries.features.find(feature => feature.properties.ADMIN === countryName);
		setSelectedPolygon(foundPolygon)
		getRadioStations(foundPolygon.properties.ISO_A2)
		setActiveRadioStation('')
		return foundPolygon;
	}

	const getRadioStations = (countryCode) => {
		fetch(`https://at1.api.radio-browser.info/json/stations/bycountrycodeexact/${countryCode}`).
			then(res => res.json()).
			then(data => { setRadioStations(data) }
		)
	}

	const selectCountryOnClick = (polygon, event, { lat, lng }) => {
		const coordinates = { lat, lng };
		getRadioStations(polygon.properties.ISO_A2)
		setActiveRadioStation('')
		centerMap({
			lat: lat,
			lng: lng,
		})
		setSelectedPolygon(polygon);
	}

	const createrequestCountry = (event) => {
		setrequestCountry(event.target.value)
	}

	useEffect(() => {
		fetch('//raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson').
		then(res => res.json()).
		then(setCountries);
		centerMap(defaultGlobePosition);
	}, []);

	return (
		<>
			<div className="grow p-24 3xl:p-28 relative z-[1] items-start h-screen overflow-hidden">

				{/* wrapper: globe */}
				<div className="absolute inset-0">
					<Globe
						ref={globeEl}
						backgroundColor='#030a1c'
						showGlobe={false}
						showAtmosphere={false}
						lineHoverPrecision={0}
						polygonsData={countries.features}
						polygonSideColor={() => 'rgba(14, 165, 233, 0.05)'}
						polygonStrokeColor={() => '#4ade80'}
						PolygonlabelColor={() => 'rgba(255, 165, 0, 0.75)'}
						polygonLabel={({ properties: d }) => `<b style="background-color: rgb(71 85 105); color: white; border-radius: 0.25rem; font-size: 0.75rem; text-transform: uppercase; font-family: 'Outfit', sans-serif; font-weight: 500; padding: 0.5rem 1rem;">${d.ADMIN}</b>`}
						polygonAltitude={d => d === (hoverD || selectedPolygon) ? 0.12 : 0.06}
						polygonCapColor={d => d === (hoverD || selectedPolygon) ? 'rgba(74, 222, 128, 0.95' : 'rgba(74, 222, 128, 0.7'}
						polygonsTransitionDuration={400}
						onPolygonClick={selectCountryOnClick}
						onPolygonHover={setHoverD}
					/>
				</div>
				{/* wrapper: globe end */}

				{/* wrapper: countries extra list */}
				<div className={(showCountriesList ? "translate-x-0 " : 'translate-x-full ') + "bg-white h-screen py-20 px-8 top-0 absolute right-0 transition-transform duration-300 z-30"}>
					<div className="relative h-full w-60">
						<div className="min-h-full h-full overflow-y-auto absolute inset-0">
							<ul className='flex flex-col gap-y-1'>
								{countries.features.map((item) => {
								return (
									<li key={item.properties.ADMIN}>
										<button
											className={((selectedPolygon?.properties.ADMIN === item.properties.ADMIN) ? 'text-emerald-400 ' : '') + 'px-4 py-1 w-full text-left transition-colors duration-300 hover:text-emerald-400'}
											onClick={() => {
												selectPolygon(item.properties.ADMIN);
											}}>
											<h3 className='font-medium text-sm'>{item.properties.ADMIN}</h3>
										</button>
									</li>
								)
								})}
							</ul>
						</div>
					</div>
				</div>
				{/* wrapper: countries extra list end */}

				{/* wrapper: countries navigation */}
				<div className="absolute">
					<ul className="flex gap-x-1 list-none">
						<li>
							<button
								className="text-white px-6 py-2 bg-slate-600 rounded"
								onClick={() => {centerMap(defaultGlobePosition)}}>
								center
							</button>
						</li>
						<li>
							<button
								className={(showCountriesList ? 'bg-emerald-400 ' : 'bg-slate-600 ') + "text-white px-6 py-2 rounded"}
								onClick={toggleCountriesList}>
								all countries
							</button>
						</li>
					</ul>
				</div>
				{/* wrapper: countries navigation end */}

				{/* wrapper: country name, radio station */}
				{selectedPolygon && (
					<h1 className='absolute text-white font-medium text-2xl z-10 left-24 top-24 right-24 h-10 pointer-events-none text-center flex items-center justify-center'>
						{selectedPolygon?.properties.ADMIN} {activeRadioStation && ': ' + activeRadioStation.name}
					</h1>
				)}
				{/* wrapper: country name, radio station end */}

				{/* wrapper: searchbar */}
				<div className="absolute bottom-24 left-24 right-24 pointer-events-none group">

					{requestCountry.length > 1 && (
						<ul className='rounded border border-slate-600 w-60 pointer-events-auto py-4  overflow-y-auto max-h-[50vh]'>
						{countries.features.filter((item) => {
							return (
							item.properties.ADMIN.toLowerCase().includes(requestCountry.toLowerCase())
							)
						}

						).map((item) => {
							return (
							<li key={item.properties.ADMIN}>
								<button className={((selectedPolygon?.properties.ADMIN === item.properties.ADMIN) ? 'text-emerald-400 ' : 'text-white ') + 'px-4 py-1 w-full text-center transition-colors duration-300 hover:text-emerald-400'} onClick={() => {
								selectPolygon(item.properties.ADMIN);
								}
								}><h3 className='font-medium text-sm'>{item.properties.ADMIN}</h3></button>
							</li>
							)
						})}
						</ul>
					)}

					<input
						onChange={createrequestCountry}
						placeholder='find a country (min. 2 char)'
						type="text"
						value={requestCountry}
						className='pointer-events-auto placeholder:text-slate-600/50 border-b border-slate-600 h-10 text-center font-medium !outline-0 group-focus-within:border-emerald-400 text-white flex items-center justify-center bg-transparent transition duration-300 w-60'
					/>

				</div>
				{/* wrapper: searchbar end */}
				
				{/* wrapper: radio player, radio stations list */}
				{selectedPolygon && (

					<div className="absolute right-24 top-24 bottom-24 flex flex-col gap-y-1">

						<div className="relative grow flex flex-col gap-1">

							{/* wrapper: react-player component */}
							<div className="fixed right-0 top-0">
								<ReactPlayer playing={isPlaying} url={activeRadioStation.url_resolved} height={0} width={0} />
							</div>
							{/* wrapper: react-player component end */}

							{/* wrapper: radio stations list */}
							<div className="rounded border border-slate-600 w-60 pointer-events-auto min-h-full">

								{radioStations.length > 0 && (
									<ul className="list-none overflow-y-auto h-full max-h-[calc(100vh-14.875rem)] py-4">
										{radioStations.map((radioStation, index) => {
											return (
												((radioStation.name).trim()).length > 1 && (
													<li key={index} className='a'>
														<button
															onClick={() => { setActiveRadioStation(radioStation) }}
															className={(activeRadioStation.name === radioStation.name ? "text-emerald-400 " : "text-white ") + "px-4 py-1 w-full text-center transition-colors duration-300 hover:text-emerald-400"}
														>
															<h3 className='font-medium text-sm'>{radioStation.name}</h3>
														</button>
													</li>
												)
											)
										})}
									</ul>
								)}

							</div>
							{/* wrapper: radio stations list end */}

						</div>

						{/* wrapper: custom radio player */}
						<div className="relative h-10 flex gap-1">
							<button
								onClick={() => { setIsPlaying(true) }}
								className={(isPlaying ? "bg-emerald-400 " : "bg-slate-600 ") + "text-white px-6 py-2 rounded text-center hover:bg-emerald-400 transition-colors duration-300 grow"}
							>
								play
							</button>
							<button
								onClick={() => { setIsPlaying(false) }}
								className={(isPlaying ? "bg-slate-600 " : "bg-emerald-400 ") + "text-white px-6 py-2 rounded text-center hover:bg-emerald-400 transition-colors duration-300 grow"}
							>
								pause
							</button>
						</div>
						{/* wrapper: custom radio player end */}

					</div>

				)}
				{/* wrapper: radio player, radio stations list end */}

			</div>
		</>
	)
}

export default App
