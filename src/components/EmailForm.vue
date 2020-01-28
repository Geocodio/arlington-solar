<template>
    <div class="bg-yellow-700">
        <div class="container mx-auto p-8">
            <p class="text-xl text-gray-200 my-2"><strong>What can you do?</strong> Join a solar co-op for your home or business!  Leave  your email and we’ll be in touch with more info:</p>

            <form class="mb-8" name="signup" method="post" data-netlify="true" data-netlify-honeypot="bot-field">
                <input type="hidden" name="form-name" value="signup" />

                <div class="flex my-2">
                    <label class="block flex-1 text-gray-200 font-bold">
                        <input class="mr-2" type="checkbox" name="type[]" value="residential">
                        <span class="text-lg">
                            Residential Solar Co-op
                        </span>
                    </label>

                    <label class="block flex-1 text-gray-200 font-bold">
                        <input class="mr-2" type="checkbox" name="type[]" value="commercial">
                        <span class="text-lg">
                            Commercial Solar Co-op
                        </span>
                    </label>
                </div>

                <div class="flex">
                    <input type="email" name="email" class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" placeholder="your@email.com" />
                    <button type="submit" class="bg-yellow-300 font-bold px-4 py-3 flex-none rounded ml-2">Sign up</button>
                </div>
            </form>
        </div>
    </div>
</template>
