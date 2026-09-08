export default function ForgotPassword() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Lupa Kata Sandi
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Masukkan email untuk dapatkan tautan reset kata sandi
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Alamat Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Kirim Tautan Reset
              </button>
            </div>
          </form>
          <div className="mt-6">
            <p className="mt-2 text-center text-sm text-gray-600">
              Kembali ke{' '}
              <a href="/sign-in" className="font-medium text-indigo-600 hover:text-indigo-500">
                halaman masuk
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
