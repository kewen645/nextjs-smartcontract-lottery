import { ConnectButton } from '@web3uikit/web3'

const Header = () => {
	return (
		<div className='flex justify-between mt-10'>
			<h1 className='text-3xl font-bold pl-5 pb-2'>Decentralied Lottery</h1>
			<ConnectButton moralisAuth={false} />
		</div>
	)
}

export default Header
